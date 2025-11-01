import axios from 'axios'

// Crear instancia de axios con la URL base desde las variables de entorno
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requests (opcional: agregar token de autenticación)
api.interceptors.request.use(
  (config) => {
    // Aquí puedes agregar token de autenticación si es necesario
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor para responses (manejo de errores global)
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Manejo global de errores
    if (error.response) {
      // El servidor respondió con un código de error
      console.error('Error de respuesta:', error.response.data)
    } else if (error.request) {
      // La petición se hizo pero no hubo respuesta
      console.error('Error de red:', error.request)
    } else {
      // Algo más causó el error
      console.error('Error:', error.message)
    }
    return Promise.reject(error)
  }
)

export default api

