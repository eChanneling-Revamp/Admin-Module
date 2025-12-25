const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface User {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateUserData {
  email: string
  password: string
  name?: string
  role?: string
}

export interface UpdateUserData {
  name?: string
  role?: string
  isActive?: boolean
}

export interface UserQueryParams {
  page?: number
  limit?: number
  search?: string
  role?: string
  isActive?: boolean
  sortBy?: 'email' | 'name' | 'createdAt' | 'lastLoginAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedUsers {
  users: User[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const userApi = {
  getAll: async (params?: UserQueryParams): Promise<PaginatedUsers> => {
    console.log('User API: Fetching users with params:', params);
    const token = localStorage.getItem('auth_token');
    console.log('User API: Token exists:', !!token);
    
    const queryString = params ? 
      '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString() : '';
    
    const response = await fetch(`${API_BASE_URL}/api/users${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('User API: Response status:', response.status);
    
    if (!response.ok) {
      console.error('User API: Failed response:', response.statusText);
      throw new Error('Failed to fetch users')
    }

    const data = await response.json();
    console.log('User API: Received data:', data);
    
    // Handle paginated response format
    if (data.data && Array.isArray(data.data)) {
      // Return paginated format expected by frontend
      return {
        users: data.data,
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 10,
        total: data.pagination?.total || data.data.length,
        totalPages: data.pagination?.totalPages || 1
      };
    }
    
    // Handle direct response or fallback
    return data.data || data
  },

  getById: async (id: string): Promise<User | null> => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch user')
    }

    const data = await response.json();
    return data.data || data
  },

  create: async (data: CreateUserData): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create user')
    }

    const result = await response.json();
    return result.data || result
  },

  update: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update user')
    }

    const result = await response.json();
    return result.data || result
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete user')
    }
  },

  toggleStatus: async (id: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/api/users/${id}/toggle-status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to toggle user status')
    }

    const data = await response.json();
    return data.data || data
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/users/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch user stats')
    }

    const data = await response.json();
    return data.data || data
  },
}
