const DEFAULT_PAYMENT_API_URL = "/payment/api/v1/payments/"
const HEALTH_LIVE_PATH = "/payment/api/v1/health/live"
const HEALTH_PATH = "/payment/api/v1/health"

const normalizePaymentApiUrl = (value: string): string => {
	const trimmedValue = value.trim()
	if (!trimmedValue) {
		return DEFAULT_PAYMENT_API_URL
	}

	try {
		const parsed = new URL(trimmedValue)
		const normalizedPath = `${parsed.pathname}${parsed.search}`
		return normalizedPath || DEFAULT_PAYMENT_API_URL
	} catch {
		return trimmedValue
	}
}

const PAYMENT_API_URL = normalizePaymentApiUrl(process.env.NEXT_PUBLIC_PAYMENT_API_URL || DEFAULT_PAYMENT_API_URL)
const PAYMENT_CACHE_TTL_MS = 30_000

type JsonObject = Record<string, unknown>

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED" | "CANCELLED" | "UNPAID"
export type PaymentMethod = "CREDIT_CARD" | "DEBIT_CARD" | "BANK_TRANSFER" | "CASH" | "MOBILE_PAYMENT" | "OTHER"

export interface PaymentMetadata extends Record<string, unknown> {
	patientName?: string
	patientEmail?: string
	patientPhone?: string
	appointmentId?: string
}

export interface Transaction {
	id: string
	bookingId: string | null
	userId: string | null
	amount: number
	currency: string
	psp: string | null
	pspPaymentId: string | null
	pspReference: string | null
	paymentMethod: PaymentMethod
	sourcePaymentMethod: string
	status: PaymentStatus
	sourceStatus: string
	metadata: PaymentMetadata | null
	transactionId: string | null
	createdAt: string
	updatedAt: string
	expiresAt: string | null
	appointment?: {
		id: string
		appointmentNumber: string
	}
}

export interface PaymentStatistics {
	totalTransactions: number
	totalAmount: number
	completedAmount: number
	pendingAmount: number
	refundedAmount: number
	byStatus: Record<string, { count: number; amount: number }>
	byMethod: Record<string, { count: number; amount: number }>
}

export interface TransactionSearchParams {
	searchTerm?: string
	status?: PaymentStatus
	paymentMethod?: PaymentMethod
	sortBy?: "createdAt" | "amount" | "status"
	sortOrder?: "asc" | "desc"
	page?: number
	limit?: number
}

export interface PaginatedResponse<T> {
	success: boolean
	data: T[]
	pagination: {
		page: number
		limit: number
		total: number
		totalPages: number
	}
}

export interface SingleResponse<T> {
	success: boolean
	data: T
	message?: string
}

export interface PaymentServiceHealth {
	status: string
	timestamp: string
	uptime: number
	service?: string
	version?: string
}

export interface HealthProbeResult {
	ok: boolean
	endpoint: string
	latencyMs: number | null
	data: PaymentServiceHealth | null
	error: string | null
}

export interface PayHereIntegrationStatus {
	gateway: "PayHere"
	connected: boolean
	checkedAt: string
	message: string
	live: HealthProbeResult
	health: HealthProbeResult
}

interface RawPaymentRecord {
	id: string
	paymentId?: string | null
	bookingId?: string | null
	appointmentId?: string | null
	userId?: string | null
	amount?: string | number | null
	currency?: string | null
	psp?: string | null
	gateway?: string | null
	provider?: string | null
	pspPaymentId?: string | null
	pspReference?: string | null
	paymentMethod?: string | null
	method?: string | null
	status?: string | null
	paymentStatus?: string | null
	metadata?: PaymentMetadata | null
	createdAt?: string | null
	created_at?: string | null
	updatedAt?: string | null
	updated_at?: string | null
	expiresAt?: string | null
	expires_at?: string | null
}

let paymentsCache: Transaction[] | null = null
let paymentsCacheExpiry = 0

const isObject = (value: unknown): value is JsonObject => {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

const normalizeText = (value: string | null | undefined): string => {
	return typeof value === "string" ? value.trim() : ""
}

const normalizeKey = (value: string | null | undefined): string => {
	return normalizeText(value)
		.toUpperCase()
		.replace(/[\s-]+/g, "_")
}

const parseAmount = (value: string | number | null | undefined): number => {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value
	}

	if (typeof value === "string") {
		const parsed = Number(value)
		return Number.isFinite(parsed) ? parsed : 0
	}

	return 0
}

const parseTime = (value: string): number => {
	const timestamp = new Date(value).getTime()
	return Number.isFinite(timestamp) ? timestamp : 0
}

const toRawRecord = (value: unknown): RawPaymentRecord | null => {
	if (!isObject(value)) {
		return null
	}

	const record = value as unknown as RawPaymentRecord
	const recordIdCandidates = [
		record.id,
		record.paymentId,
		record.transactionId,
		record.pspPaymentId,
		record.pspReference,
	]
	const resolvedId = recordIdCandidates.find((candidate) => typeof candidate === "string" && candidate.trim())

	if (!resolvedId) {
		return null
	}

	return {
		...record,
		id: resolvedId,
	}
}

const toRawRecordArray = (value: unknown): RawPaymentRecord[] | null => {
	if (!Array.isArray(value)) {
		return null
	}

	return value
		.map((item) => toRawRecord(item))
		.filter((item): item is RawPaymentRecord => item !== null)
}

const extractMessage = (payload: unknown): string | null => {
	if (!isObject(payload)) {
		return null
	}

	const messageCandidate = payload.message ?? payload.error ?? payload.detail
	if (typeof messageCandidate === "string" && messageCandidate.trim()) {
		return messageCandidate.trim()
	}

	return null
}

const extractRawPayments = (payload: unknown): RawPaymentRecord[] => {
	const topLevelArray = toRawRecordArray(payload)
	if (topLevelArray) {
		return topLevelArray
	}

	if (!isObject(payload)) {
		throw new Error("Unexpected payments API response format")
	}

	const topLevelCandidates: unknown[] = [
		payload.data,
		payload.payments,
		payload.records,
		payload.results,
		payload.items,
		payload.content,
		payload.payload,
		payload.response,
		payload.responseObject,
	]

	for (const candidate of topLevelCandidates) {
		const records = toRawRecordArray(candidate)
		if (records) {
			return records
		}
	}

	if (isObject(payload.data)) {
		const nestedData = payload.data as JsonObject
		const nestedCandidates: unknown[] = [
			nestedData.data,
			nestedData.payments,
			nestedData.records,
			nestedData.results,
			nestedData.items,
			nestedData.content,
			nestedData.payload,
			nestedData.response,
			nestedData.responseObject,
		]

		for (const candidate of nestedCandidates) {
			const records = toRawRecordArray(candidate)
			if (records) {
				return records
			}
		}
	}

	const singleRecord = toRawRecord(payload)
	if (singleRecord) {
		return [singleRecord]
	}

	const emptyCollectionHints = [
		payload.total,
		payload.count,
		isObject(payload.data) ? (payload.data as JsonObject).total : undefined,
		isObject(payload.data) ? (payload.data as JsonObject).count : undefined,
	]

	if (emptyCollectionHints.some((candidate) => candidate === 0 || candidate === "0")) {
		return []
	}

	throw new Error("Unexpected payments API response format")
}

const normalizeStatus = (rawStatus: string | null | undefined): PaymentStatus => {
	const status = normalizeKey(rawStatus)

	switch (status) {
		case "COMPLETED":
		case "PAID":
		case "SUCCESS":
		case "SUCCEEDED":
		case "CAPTURED":
			return "COMPLETED"
		case "FAILED":
		case "FAILURE":
		case "ERROR":
		case "DECLINED":
			return "FAILED"
		case "REFUNDED":
		case "PARTIALLY_REFUNDED":
			return "REFUNDED"
		case "CANCELLED":
		case "CANCELED":
		case "VOIDED":
			return "CANCELLED"
		case "UNPAID":
			return "UNPAID"
		default:
			return "PENDING"
	}
}

const normalizeMethod = (rawMethod: string | null | undefined): PaymentMethod => {
	const method = normalizeKey(rawMethod)

	switch (method) {
		case "CARD":
		case "CREDIT_CARD":
		case "CREDITCARD":
			return "CREDIT_CARD"
		case "DEBIT_CARD":
		case "DEBITCARD":
			return "DEBIT_CARD"
		case "BANK_TRANSFER":
		case "BANK":
		case "TRANSFER":
			return "BANK_TRANSFER"
		case "CASH":
			return "CASH"
		case "MOBILE":
		case "MOBILE_PAYMENT":
		case "WALLET":
		case "E_WALLET":
		case "EWALLET":
			return "MOBILE_PAYMENT"
		default:
			return "OTHER"
	}
}

const normalizePaymentRecord = (record: RawPaymentRecord): Transaction => {
	const sourceStatus = normalizeKey(record.status || record.paymentStatus) || "CREATED"
	const sourcePaymentMethod = normalizeKey(record.paymentMethod || record.method) || "UNKNOWN"
	const metadata = record.metadata ?? null
	const bookingIdFromPayload = normalizeText(record.bookingId)
	const bookingIdFromAlternateField = normalizeText(record.appointmentId)
	const bookingIdFromMetadata = normalizeText(metadata?.appointmentId)
	const bookingId = bookingIdFromPayload || bookingIdFromAlternateField || bookingIdFromMetadata || null
	const createdAt = normalizeText(record.createdAt || record.created_at) || new Date().toISOString()
	const pspReference = normalizeText(record.pspReference) || null
	const pspPaymentId = normalizeText(record.pspPaymentId) || null
	const transactionId = pspReference || pspPaymentId || `${record.id.slice(0, 12)}`

	return {
		id: record.id,
		bookingId: bookingId || bookingIdFromAlternateField || null,
		userId: normalizeText(record.userId) || null,
		amount: parseAmount(record.amount),
		currency: normalizeText(record.currency) || "LKR",
		psp: normalizeText(record.psp || record.gateway || record.provider) || null,
		pspPaymentId,
		pspReference,
		paymentMethod: normalizeMethod(record.paymentMethod || record.method),
		sourcePaymentMethod,
		status: normalizeStatus(record.status || record.paymentStatus),
		sourceStatus,
		metadata,
		transactionId,
		createdAt,
		updatedAt: normalizeText(record.updatedAt || record.updated_at) || createdAt,
		expiresAt: normalizeText(record.expiresAt || record.expires_at) || null,
		appointment: bookingId
			? {
					id: bookingId,
					appointmentNumber: bookingId,
				}
			: undefined,
	}
}

const getPaymentHeaders = (): HeadersInit => {
	return {
		Accept: "application/json",
	}
}

const getHealthHeaders = (): HeadersInit => {
	return {
		Accept: "application/json",
	}
}

const toPaymentServiceHealth = (payload: unknown): PaymentServiceHealth => {
	if (!isObject(payload)) {
		throw new Error("Unexpected health response format")
	}

	const status = normalizeText(typeof payload.status === "string" ? payload.status : "")
	const timestamp = normalizeText(typeof payload.timestamp === "string" ? payload.timestamp : "")
	const uptime =
		typeof payload.uptime === "number"
			? payload.uptime
			: typeof payload.uptime === "string"
				? Number(payload.uptime)
				: NaN

	if (!status || !timestamp || !Number.isFinite(uptime)) {
		throw new Error("Health response is missing required fields")
	}

	const service = normalizeText(typeof payload.service === "string" ? payload.service : "") || undefined
	const version = normalizeText(typeof payload.version === "string" ? payload.version : "") || undefined

	return {
		status,
		timestamp,
		uptime,
		service,
		version,
	}
}

const probeHealthEndpoint = async (endpoint: string): Promise<HealthProbeResult> => {
	const startedAt = Date.now()

	try {
		const response = await fetch(endpoint, {
			method: "GET",
			headers: getHealthHeaders(),
		})

		const latencyMs = Date.now() - startedAt
		const responseText = await response.text()
		let payload: unknown = {}

		if (responseText.trim()) {
			try {
				payload = JSON.parse(responseText)
			} catch {
				if (!response.ok) {
					throw new Error(responseText || `Health check failed (${response.status})`)
				}
				throw new Error("Health endpoint returned an invalid JSON response")
			}
		}

		if (!response.ok) {
			const message = extractMessage(payload) || `Health check failed (${response.status})`
			throw new Error(message)
		}

		return {
			ok: true,
			endpoint,
			latencyMs,
			data: toPaymentServiceHealth(payload),
			error: null,
		}
	} catch (error) {
		return {
			ok: false,
			endpoint,
			latencyMs: Date.now() - startedAt,
			data: null,
			error: error instanceof Error ? error.message : "Health endpoint check failed",
		}
	}
}

const getCachedPayments = (forceRefresh: boolean): Transaction[] | null => {
	if (forceRefresh) {
		return null
	}

	if (!paymentsCache || Date.now() > paymentsCacheExpiry) {
		return null
	}

	return paymentsCache
}

const fetchPayments = async (forceRefresh = false): Promise<Transaction[]> => {
	const cached = getCachedPayments(forceRefresh)
	if (cached) {
		return cached
	}

	const response = await fetch(PAYMENT_API_URL, {
		method: "GET",
		headers: getPaymentHeaders(),
		cache: "no-store",
	})

	const responseText = await response.text()
	let payload: unknown = []

	if (responseText.trim()) {
		try {
			payload = JSON.parse(responseText)
		} catch {
			if (!response.ok) {
				throw new Error(responseText || `Failed to fetch payments (${response.status})`)
			}
			throw new Error("Payments API returned an invalid JSON response")
		}
	}

	if (!response.ok) {
		const message = extractMessage(payload) || `Failed to fetch payments (${response.status})`
		throw new Error(message)
	}

	const normalizedPayments = extractRawPayments(payload)
		.map((record) => normalizePaymentRecord(record))
		.sort((a, b) => parseTime(b.createdAt) - parseTime(a.createdAt))

	paymentsCache = normalizedPayments
	paymentsCacheExpiry = Date.now() + PAYMENT_CACHE_TTL_MS

	return normalizedPayments
}

const matchesSearch = (payment: Transaction, rawSearchTerm: string): boolean => {
	const searchTerm = rawSearchTerm.trim().toLowerCase()
	if (!searchTerm) {
		return true
	}

	const metadataValues = payment.metadata
		? Object.values(payment.metadata).map((value) => String(value ?? ""))
		: []

	const haystack = [
		payment.id,
		payment.transactionId ?? "",
		payment.bookingId ?? "",
		payment.userId ?? "",
		payment.sourceStatus,
		payment.sourcePaymentMethod,
		payment.psp ?? "",
		...metadataValues,
	]
		.join(" ")
		.toLowerCase()

	return haystack.includes(searchTerm)
}

const sortTransactions = (
	transactions: Transaction[],
	sortBy: TransactionSearchParams["sortBy"],
	sortOrder: TransactionSearchParams["sortOrder"]
): Transaction[] => {
	const resolvedSortBy = sortBy || "createdAt"
	const resolvedSortOrder = sortOrder || "desc"

	const sorted = [...transactions].sort((a, b) => {
		if (resolvedSortBy === "amount") {
			return a.amount - b.amount
		}

		if (resolvedSortBy === "status") {
			return a.sourceStatus.localeCompare(b.sourceStatus)
		}

		return parseTime(a.createdAt) - parseTime(b.createdAt)
	})

	return resolvedSortOrder === "asc" ? sorted : sorted.reverse()
}

const calculateStatistics = (payments: Transaction[]): PaymentStatistics => {
	const byStatus: PaymentStatistics["byStatus"] = {
		PENDING: { count: 0, amount: 0 },
		COMPLETED: { count: 0, amount: 0 },
		FAILED: { count: 0, amount: 0 },
		REFUNDED: { count: 0, amount: 0 },
		CANCELLED: { count: 0, amount: 0 },
		UNPAID: { count: 0, amount: 0 },
	}

	const byMethod: PaymentStatistics["byMethod"] = {
		CREDIT_CARD: { count: 0, amount: 0 },
		DEBIT_CARD: { count: 0, amount: 0 },
		BANK_TRANSFER: { count: 0, amount: 0 },
		CASH: { count: 0, amount: 0 },
		MOBILE_PAYMENT: { count: 0, amount: 0 },
		OTHER: { count: 0, amount: 0 },
	}

	let totalAmount = 0
	let completedAmount = 0
	let pendingAmount = 0
	let refundedAmount = 0

	for (const payment of payments) {
		totalAmount += payment.amount

		if (!byStatus[payment.status]) {
			byStatus[payment.status] = { count: 0, amount: 0 }
		}
		byStatus[payment.status].count += 1
		byStatus[payment.status].amount += payment.amount

		if (!byMethod[payment.paymentMethod]) {
			byMethod[payment.paymentMethod] = { count: 0, amount: 0 }
		}
		byMethod[payment.paymentMethod].count += 1
		byMethod[payment.paymentMethod].amount += payment.amount

		if (payment.status === "COMPLETED") {
			completedAmount += payment.amount
		}

		if (payment.status === "PENDING" || payment.status === "UNPAID") {
			pendingAmount += payment.amount
		}

		if (payment.status === "REFUNDED") {
			refundedAmount += payment.amount
		}
	}

	return {
		totalTransactions: payments.length,
		totalAmount,
		completedAmount,
		pendingAmount,
		refundedAmount,
		byStatus,
		byMethod,
	}
}

const escapeCsvValue = (value: string | number | null): string => {
	const stringValue = value === null ? "" : String(value)
	if (/[",\n]/.test(stringValue)) {
		return `"${stringValue.replace(/"/g, '""')}"`
	}
	return stringValue
}

export const paymentApi = {
	clearCache: () => {
		paymentsCache = null
		paymentsCacheExpiry = 0
	},

	getPayments: async (
		params: TransactionSearchParams = {},
		options: { forceRefresh?: boolean } = {}
	): Promise<PaginatedResponse<Transaction>> => {
		const payments = await fetchPayments(Boolean(options.forceRefresh))

		const filteredPayments = payments.filter((payment) => {
			if (params.searchTerm && !matchesSearch(payment, params.searchTerm)) {
				return false
			}

			if (params.status && payment.status !== params.status) {
				return false
			}

			if (params.paymentMethod && payment.paymentMethod !== params.paymentMethod) {
				return false
			}

			return true
		})

		const sortedPayments = sortTransactions(filteredPayments, params.sortBy, params.sortOrder)

		const limit = Math.max(1, params.limit || 10)
		const total = sortedPayments.length
		const totalPages = Math.max(1, Math.ceil(total / limit))
		const requestedPage = Math.max(1, params.page || 1)
		const page = Math.min(requestedPage, totalPages)
		const start = (page - 1) * limit
		const paginatedData = sortedPayments.slice(start, start + limit)

		return {
			success: true,
			data: paginatedData,
			pagination: {
				page,
				limit,
				total,
				totalPages,
			},
		}
	},

	getPaymentStatistics: async (
		options: { forceRefresh?: boolean } = {}
	): Promise<SingleResponse<PaymentStatistics>> => {
		const payments = await fetchPayments(Boolean(options.forceRefresh))

		return {
			success: true,
			data: calculateStatistics(payments),
		}
	},

	getServiceHealthLive: async (): Promise<SingleResponse<PaymentServiceHealth>> => {
		const probe = await probeHealthEndpoint(HEALTH_LIVE_PATH)

		if (!probe.ok || !probe.data) {
			throw new Error(probe.error || "Failed to check payment live health")
		}

		return {
			success: true,
			data: probe.data,
		}
	},

	getServiceHealth: async (): Promise<SingleResponse<PaymentServiceHealth>> => {
		const probe = await probeHealthEndpoint(HEALTH_PATH)

		if (!probe.ok || !probe.data) {
			throw new Error(probe.error || "Failed to check payment service health")
		}

		return {
			success: true,
			data: probe.data,
		}
	},

	checkPayHereIntegration: async (): Promise<PayHereIntegrationStatus> => {
		const [liveProbe, healthProbe] = await Promise.all([
			probeHealthEndpoint(HEALTH_LIVE_PATH),
			probeHealthEndpoint(HEALTH_PATH),
		])

		const liveStatus = normalizeKey(liveProbe.data?.status)
		const healthStatus = normalizeKey(healthProbe.data?.status)
		const isLiveAlive = liveProbe.ok && liveStatus === "ALIVE"
		const isHealthOk = healthProbe.ok && healthStatus === "OK"
		const connected = isLiveAlive && isHealthOk

		let message = "PayHere integration check failed."

		if (connected) {
			message = "PayHere integration is healthy and reachable."
		} else {
			const errors: string[] = []

			if (!liveProbe.ok) {
				errors.push(`Live probe error: ${liveProbe.error}`)
			} else if (!isLiveAlive) {
				errors.push(`Live status is '${liveProbe.data?.status ?? "unknown"}'`)
			}

			if (!healthProbe.ok) {
				errors.push(`Health probe error: ${healthProbe.error}`)
			} else if (!isHealthOk) {
				errors.push(`Health status is '${healthProbe.data?.status ?? "unknown"}'`)
			}

			if (errors.length > 0) {
				message = errors.join(" | ")
			}
		}

		return {
			gateway: "PayHere",
			connected,
			checkedAt: new Date().toISOString(),
			message,
			live: liveProbe,
			health: healthProbe,
		}
	},

	generateCsv: (payments: Transaction[]): string => {
		const header = [
			"Transaction ID",
			"Payment ID",
			"Booking ID",
			"User ID",
			"Amount",
			"Currency",
			"PSP",
			"Payment Method",
			"Status",
			"Created At",
			"Updated At",
		]

		const rows = payments.map((payment) => {
			return [
				payment.transactionId ?? payment.id,
				payment.id,
				payment.bookingId,
				payment.userId,
				payment.amount,
				payment.currency,
				payment.psp,
				payment.sourcePaymentMethod,
				payment.sourceStatus,
				payment.createdAt,
				payment.updatedAt,
			].map((value) => escapeCsvValue(value === undefined ? null : value))
		})

		return [header.map((value) => escapeCsvValue(value)).join(","), ...rows.map((row) => row.join(","))].join("\n")
	},
}
