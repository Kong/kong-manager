import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios'
import { config } from 'config'

const adminApiUrl = config.ADMIN_API_URL

class ApiService {
  instance: AxiosInstance

  constructor () {
    this.instance = axios.create({
      timeout: 30000,
    })
  }

  getInfo () {
    return this.instance.get(`${adminApiUrl}`)
  }

  // entity-specific methods
  findAll (entity: string, params: Pick<AxiosRequestConfig, 'params'> = {}) {
    return this.instance.get(`${adminApiUrl}/${entity}`, { params })
  }

  findRecord (entity: string, id: string) {
    return this.instance.get(`${adminApiUrl}/${entity}/${id}`)
  }

  createRecord (entity: string, data: Record<string, unknown>) {
    return this.instance.post(`${adminApiUrl}/${entity}`, data)
  }

  updateRecord (entity: string, id: string, data: Record<string, unknown>) {
    return this.instance.patch(`${adminApiUrl}/${entity}/${id}`, data)
  }

  deleteRecord (entity: string, id: string) {
    return this.instance.delete(`${adminApiUrl}/${entity}/${id}`)
  }

  // generic methods
  get (url = '', config: AxiosRequestConfig = {}) {
    return this.instance.get(`${adminApiUrl}/${url}`, config)
  }

  post (url = '', data?: Record<string, unknown>, config: AxiosRequestConfig = {}) {
    return this.instance.post(`${adminApiUrl}/${url}`, data, config)
  }

  put (url = '', data?: Record<string, unknown>, config: AxiosRequestConfig = {}) {
    return this.instance.put(`${adminApiUrl}/${url}`, data, config)
  }

  patch (url = '', data?: Record<string, unknown>, config: AxiosRequestConfig = {}) {
    return this.instance.patch(`${adminApiUrl}/${url}`, data, config)
  }

  delete (url = '', config: AxiosRequestConfig = {}) {
    return this.instance.delete(`${adminApiUrl}/${url}`, config)
  }
}

export const apiService = new ApiService()
