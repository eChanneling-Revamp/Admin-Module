const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_BASE_URL) {
  throw new Error('NEXT_PUBLIC_API_URL environment variable is not set')
}

export type HospitalStatus = 'PENDING' | 'APPROVED' | 'REJECTED'

export interface Hospital {
  id: string
  name: string
  address: string
  city: string
  district: string
  contactNumber: string
  email: string
  website: string
  facilities: string[]
  isActive: boolean
  createdAt: string
  status: HospitalStatus
  profileImage: string | null
}

export interface CreateHospitalData {
  name: string
  email: string
  address?: string
  city?: string
  district?: string
  contactNumber?: string
  website?: string
  facilities?: string[]
  profileImage?: string
}

export interface UpdateHospitalData extends Partial<CreateHospitalData> {
  isActive?: boolean
  status?: HospitalStatus
}

export interface HospitalGroupHospital {
  id: string
  name: string
  city: string
  district: string
  hospitalType: string
  status: HospitalStatus
  doctorCount: number
  facilities: string[]
  profileImage: string | null
}

export interface HospitalGroup {
  id: string
  hospitalType: string
  totalHospitals: number
  statusBreakdown: Record<HospitalStatus, number>
  hospitals: HospitalGroupHospital[]
  doctorCount: number
  facilityCount: number
  cities: string[]
  districts: string[]
  districtCount: number
}

export const hospitalApi = {
  getAll: async (): Promise<Hospital[]> => {
    console.log('Hospital API: Fetching all hospitals');
    const token = localStorage.getItem('auth_token');
    console.log('Hospital API: Token exists:', !!token);
    
    const response = await fetch(`${API_BASE_URL}/api/hospitals`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Hospital API: Response status:', response.status);
    
    if (!response.ok) {
      console.error('Hospital API: Failed response:', response.statusText);
      throw new Error('Failed to fetch hospitals')
    }

    const data = await response.json();
    console.log('Hospital API: Received data:', data);
    return data.data || data
  },

  getById: async (id: string): Promise<Hospital | null> => {
    const response = await fetch(`${API_BASE_URL}/api/hospitals/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch hospital')
    }

    return response.json()
  },

  create: async (data: CreateHospitalData): Promise<Hospital> => {
    const response = await fetch(`${API_BASE_URL}/api/hospitals`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create hospital')
    }

    return response.json()
  },

  update: async (id: string, data: UpdateHospitalData): Promise<Hospital> => {
    const response = await fetch(`${API_BASE_URL}/api/hospitals/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update hospital')
    }

    return response.json()
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/hospitals/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete hospital')
    }
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/hospitals/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch hospital stats')
    }

    return response.json()
  },

  getByCity: async (city: string): Promise<Hospital[]> => {
    const response = await fetch(`${API_BASE_URL}/api/hospitals/by-city?city=${encodeURIComponent(city)}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch hospitals by city')
    }

    return response.json()
  },

  updateStatus: async (id: string, status: HospitalStatus): Promise<Hospital> => {
    const response = await fetch(`${API_BASE_URL}/api/hospitals/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    })

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      console.error('Hospital API: Failed to update status', response.status, text);
      throw new Error('Failed to update hospital status')
    }

    return response.json()
  },

  getGroups: async (): Promise<HospitalGroup[]> => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_BASE_URL}/api/hospitals/groups`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch hospital groups')
    }

    const data = await response.json()
    return data.data || data
  },
}
