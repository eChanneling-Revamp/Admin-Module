const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

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
}
