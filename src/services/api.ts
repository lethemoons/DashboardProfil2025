import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Backend URL
  timeout: 10000,
})

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

export default api
