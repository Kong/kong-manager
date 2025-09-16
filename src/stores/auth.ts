import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface User {
  username: string
  email?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  // Basit kullanıcı girişi (gerçek uygulamada API çağrısı yapılmalı)
  const login = async (username: string, password: string): Promise<boolean> => {
    // Demo için sabit kullanıcı bilgileri
    if (username === 'admin' && password === 'admin123') {
      user.value = {
        username: 'admin',
        email: 'admin@apiruler.com',
      }
      localStorage.setItem('auth_user', JSON.stringify(user.value))
      return true
    }
    return false
  }

  // Şifre değiştirme
  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    // Demo için mevcut şifre kontrolü
    if (currentPassword === 'admin123') {
      // Gerçek uygulamada API çağrısı yapılmalı
      console.log('Şifre değiştirildi:', newPassword)
      return true
    }
    return false
  }

  // Çıkış yapma
  const logout = () => {
    user.value = null
    localStorage.removeItem('auth_user')
  }

  // Sayfa yenilendiğinde kullanıcı bilgisini geri yükle
  const restoreUser = () => {
    const savedUser = localStorage.getItem('auth_user')
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser)
      } catch (error) {
        console.error('Kullanıcı bilgisi yüklenemedi:', error)
        localStorage.removeItem('auth_user')
      }
    }
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    changePassword,
    restoreUser,
  }
})
