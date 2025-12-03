// Authentication utilities

export const auth = {
  // Set authentication token
  setToken: (token: string) => {
    document.cookie = `token=${token}; path=/; max-age=86400` // 24 hours
  },

  // Get authentication token
  getToken: () => {
    const cookies = document.cookie.split(';')
    const tokenCookie = cookies.find(c => c.trim().startsWith('token='))
    return tokenCookie ? tokenCookie.split('=')[1] : null
  },

  // Remove authentication token
  removeToken: () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!auth.getToken()
  },

  // Logout user
  logout: () => {
    auth.removeToken()
    localStorage.clear()
    window.location.href = '/login'
  },

  // Login user
  login: (token: string) => {
    auth.setToken(token)
    window.location.href = '/'
  }
}

// Route utilities
export const routes = {
  home: '/',
  login: '/login',
  dashboard: '/',
  users: '/?section=users',
  learnGrow: '/?section=learn-grow'
}
