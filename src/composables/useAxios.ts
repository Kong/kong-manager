import axios from 'axios'

const axiosInstance = axios.create({
  timeout: 30000,
})

export const useAxios = () => {
  return {
    axiosInstance,
  }
}
