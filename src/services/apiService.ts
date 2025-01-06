import {
  type AxiosInstance,
  type AxiosRequestConfig,
} from 'axios'
import { config } from 'config'
import { useAxios } from '@kong-ui-public/entities-shared'

const adminApiUrl = config.ADMIN_API_URL

class ApiService {
  instance: AxiosInstance

  constructor() {
    this.instance = useAxios().axiosInstance
  }

  getInfo() {
    return this.instance.get(`${adminApiUrl}`)
  }

  // entity-specific methods
  findAll<T>(entity: string, params: Record<string, unknown>) {
    return this.instance.get<T>(`${adminApiUrl}/${entity}`, { params })
  }

  findRecord<T>(entity: string, id: string) {
    return this.instance.get<T>(`${adminApiUrl}/${entity}/${id}`)
  }

  createRecord(entity: string, data: Record<string, unknown>) {
    return this.instance.post(`${adminApiUrl}/${entity}`, data)
  }

  updateRecord(entity: string, id: string, data: Record<string, unknown>) {
    return this.instance.patch(`${adminApiUrl}/${entity}/${id}`, data)
  }

  deleteRecord(entity: string, id: string) {
    return this.instance.delete(`${adminApiUrl}/${entity}/${id}`)
  }

  // generic methods
  get<T>(url = '', config: AxiosRequestConfig = {}) {
    return this.instance.get<T>(`${adminApiUrl}/${url}`, config)
  }

  post(url = '', data?: Record<string, unknown>, config: AxiosRequestConfig = {}) {
    return this.instance.post(`${adminApiUrl}/${url}`, data, config)
  }

  put(url = '', data?: Record<string, unknown>, config: AxiosRequestConfig = {}) {
    return this.instance.put(`${adminApiUrl}/${url}`, data, config)
  }

  patch(url = '', data?: Record<string, unknown>, config: AxiosRequestConfig = {}) {
    return this.instance.patch(`${adminApiUrl}/${url}`, data, config)
  }

  delete(url = '', config: AxiosRequestConfig = {}) {
    return this.instance.delete(`${adminApiUrl}/${url}`, config)
  }
}

export const apiService = new ApiService()
