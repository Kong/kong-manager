import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { keycloak, loginWithPassword } from '@/keycloak'

export interface User {
  username: string
  email?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value && keycloak.authenticated)

  // Keycloak'tan kullanıcı bilgisini yükle
  const loadUserFromKeycloak = () => {
    if (keycloak.authenticated && keycloak.tokenParsed) {
      user.value = {
        username: keycloak.tokenParsed.preferred_username || 'Unknown',
        email: keycloak.tokenParsed.email,
      }
    }
  }

  // Keycloak ROPC flow ile login
  const login = async (username: string, password: string): Promise<boolean> => {
    const success = await loginWithPassword(username, password)
    if (success) {
      loadUserFromKeycloak()
    }
    return success
  }

  // Şifre değiştirme - Keycloak account management sayfasına yönlendir
  const changePassword = async (_currentPassword: string, _newPassword: string): Promise<boolean> => {
    // Keycloak account management sayfasını aç
    const accountUrl = `${keycloak.authServerUrl}/realms/${keycloak.realm}/account`
    window.open(accountUrl, '_blank')
    return true
  }

  // Çıkış yapma - Keycloak logout
  const logout = () => {
    keycloak.logout({
      redirectUri: window.location.origin,
    })
    user.value = null
  }

  // Sayfa yenilendiğinde kullanıcı bilgisini geri yükle (artık Keycloak'tan)
  const restoreUser = () => {
    loadUserFromKeycloak()
  }

  return {
    user,
    isAuthenticated,
    login,
    logout,
    changePassword,
    restoreUser,
    loadUserFromKeycloak,
  }
})
