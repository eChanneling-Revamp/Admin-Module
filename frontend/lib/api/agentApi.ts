const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export interface Agent {
  id: string
  name: string
  email: string
  companyName: string | null
  phone: string | null
  address: string | null
  userId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  user?: {
    id: string
    email: string
    name: string | null
    role: string
  }
}

export interface CreateAgentData {
  name: string
  email: string
  companyName?: string
  phone?: string
  address?: string
  userId?: string
}

export interface UpdateAgentData extends Partial<CreateAgentData> {
  isActive?: boolean
}

export interface AgentQueryParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
  sortBy?: 'name' | 'email' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedAgents {
  agents: Agent[]
  page: number
  limit: number
  total: number
  totalPages: number
}

export const agentApi = {
  getAll: async (params?: AgentQueryParams): Promise<PaginatedAgents> => {
    console.log('Agent API: Fetching agents with params:', params);
    const token = localStorage.getItem('auth_token');
    console.log('Agent API: Token exists:', !!token);
    
    const queryString = params ? 
      '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString() : '';
    
    const response = await fetch(`${API_BASE_URL}/api/agents${queryString}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    console.log('Agent API: Response status:', response.status);
    
    if (!response.ok) {
      console.error('Agent API: Failed response:', response.statusText);
      throw new Error('Failed to fetch agents')
    }

    const data = await response.json();
    console.log('Agent API: Received data:', data);
    
    // Handle paginated response format
    if (data.data && Array.isArray(data.data)) {
      // Return paginated format expected by frontend
      return {
        agents: data.data,
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 10,
        total: data.pagination?.total || data.data.length,
        totalPages: data.pagination?.totalPages || 1
      };
    }
    
    // Handle direct response or fallback
    return data.data || data
  },

  getById: async (id: string): Promise<Agent | null> => {
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) return null
      throw new Error('Failed to fetch agent')
    }

    const data = await response.json();
    return data.data || data
  },

  create: async (data: CreateAgentData): Promise<Agent> => {
    const response = await fetch(`${API_BASE_URL}/api/agents`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to create agent')
    }

    const result = await response.json();
    return result.data || result
  },

  update: async (id: string, data: UpdateAgentData): Promise<Agent> => {
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error('Failed to update agent')
    }

    const result = await response.json();
    return result.data || result
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/agents/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to delete agent')
    }
  },

  getStats: async () => {
    const response = await fetch(`${API_BASE_URL}/api/agents/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch agent stats')
    }

    const data = await response.json();
    return data.data || data
  },
}
