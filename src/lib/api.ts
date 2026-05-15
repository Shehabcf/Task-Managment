const API_BASE = '/api'

class ApiClient {
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'API request failed')
    }

    return data
  }

  // Auth
  async register(name: string, email: string, password: string, teamName?: string) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, teamName }),
    })
  }

  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  }

  async getMe() {
    return this.request('/auth/me')
  }

  // Teams
  async getTeams() {
    return this.request('/teams')
  }

  async createTeam(name: string) {
    return this.request('/teams', {
      method: 'POST',
      body: JSON.stringify({ name }),
    })
  }

  async joinTeam(teamId: string) {
    return this.request(`/teams/${teamId}`, {
      method: 'POST',
    })
  }

  // Projects
  async getProjects() {
    return this.request('/projects')
  }

  async createProject(name: string, description?: string) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    })
  }

  async getProject(id: string) {
    return this.request(`/projects/${id}`)
  }

  async deleteProject(id: string) {
    return this.request(`/projects/${id}`, { method: 'DELETE' })
  }

  // Tasks
  async getTasks(projectId: string) {
    return this.request(`/tasks?projectId=${projectId}`)
  }

  async createTask(data: { title: string; description?: string; status?: string; projectId: string; assignedTo?: string }) {
    return this.request('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTask(id: string, data: { title?: string; description?: string; status?: string; assignedTo?: string }) {
    return this.request(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async deleteTask(id: string) {
    return this.request(`/tasks/${id}`, { method: 'DELETE' })
  }

  // Activities
  async getActivities(projectId: string) {
    return this.request(`/activities?projectId=${projectId}`)
  }
}

export const api = new ApiClient()
