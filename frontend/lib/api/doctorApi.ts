const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

export interface Doctor {
  id: string
  name: string
  email: string
  specialization: string
  qualification: string
  experience: number
  phoneNumber: string
  consultationFee: number
  rating: number
  profileImage: string | null
  description: string
  languages: string[]
  availableDays: string[]
  isActive: boolean
  createdAt: string
  status: string
}

export interface HospitalSummary {
  id: string
  name: string
  city: string
  district: string
  isActive: boolean
}

export interface DoctorHospitalAssignment {
  doctorId: string
  doctorName: string
  specialization: string
  status: string
  primaryHospital?: HospitalSummary
  additionalHospitals: HospitalSummary[]
  weeklySessions: number
  totalHospitals: number
}

export interface DoctorHospitalAssignmentResponse {
  assignments: DoctorHospitalAssignment[]
  stats: {
    totalAssignments: number
    multiHospitalDoctors: number
    activeHospitals: number
    weeklySessions: number
  }
}

export interface CreateDoctorData {
  name: string
  email: string
  specialization?: string
  qualification?: string
  experience?: number
  phoneNumber?: string
  consultationFee?: number
  description?: string
  languages?: string[]
  availableDays?: string[]
}

export interface UpdateDoctorData extends Partial<CreateDoctorData> {
  rating?: number
  profileImage?: string
  isActive?: boolean
  status?: string
}

export interface DoctorScheduleQuery {
  startDate?: string
  endDate?: string
  doctorId?: string
  hospitalId?: string
  status?: string
  search?: string
  page?: number
  pageSize?: number
  sortOrder?: 'asc' | 'desc'
}

export interface DoctorSchedule {
  id: string
  doctorId: string
  doctorName: string
  specialization: string
  hospitalId: string
  hospitalName: string
  hospitalCity?: string | null
  location: string
  scheduledAt: string
  startTime: string
  endTime: string
  capacity: number
  booked: number
  available: number
  sessionStatus: string
  isFull: boolean
  consultationFee: number
}

export interface DoctorScheduleResponse {
  schedules: DoctorSchedule[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export const doctorApi = {
  getAll: async (): Promise<Doctor[]> => {
    console.log('Doctor API: Fetching all doctors');
    const token = localStorage.getItem('auth_token');
    console.log('Doctor API: Token exists:', !!token);
    
    const response = await fetch(`${API_BASE_URL}/api/doctors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Doctor API: Response status:', response.status);
    
    if (!response.ok) {
      console.error('Doctor API: Failed response:', response.statusText);
      throw new Error('Failed to fetch doctors')
    }

    const data = await response.json();
    console.log('Doctor API: Received data:', data);
    return data.data || data
  },

  getById: async (id: string): Promise<Doctor | null> => {
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch doctor')
    }

    return response.json()
  },

  create: async (data: CreateDoctorData): Promise<Doctor> => {
    const response = await fetch(`${API_BASE_URL}/api/doctors`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create doctor')
    }

    return response.json()
  },

  update: async (id: string, data: UpdateDoctorData): Promise<Doctor> => {
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update doctor')
    }

    return response.json()
  },

  getSchedules: async (params?: DoctorScheduleQuery): Promise<DoctorScheduleResponse> => {
    const token = localStorage.getItem('auth_token');
    const queryString = params
      ? `?${new URLSearchParams(
          Object.entries(params)
            .filter(([, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => [key, String(value)])
        )}`
      : '';

    const response = await fetch(`${API_BASE_URL}/api/doctors/schedules${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctor schedules');
    }

    const data = await response.json();
    return data.data || data;
  },

  patchStatus: async (id: string, status: string): Promise<Doctor> => {
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      throw new Error('Failed to update doctor status')
    }

    return response.json()
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/doctors/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete doctor')
    }
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/doctors/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch doctor stats')
    }

    return response.json()
  },

  getHospitalAssignments: async (): Promise<DoctorHospitalAssignmentResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/doctors/assignments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch doctor hospital assignments')
    }

    const data = await response.json()
    return data.data || data
  },
}
