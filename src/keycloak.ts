import Keycloak from 'keycloak-js'
import type { App } from 'vue'
import type { Router } from 'vue-router'

export const keycloak = new Keycloak({
  url: 'http://localhost:7080',
  realm: 'master',
  clientId: 'vue-spa',
})

/**
 * ROPC (Resource Owner Password Credentials) Flow
 * Keycloak'a username/password ile direkt login yapar
 *
 * ⚠️ Not: Bu yöntem güvenlik açısından ideal değildir.
 * Client'ta password tutulması gerekir. Production'da önerilmez.
 *
 * Keycloak Admin Console'da şunları enable etmelisin:
 * - Clients → vue-spa → Settings → Direct access grants enabled = ON
 */
export async function loginWithPassword(username: string, password: string): Promise<boolean> {
  try {
    const tokenEndpoint = `${keycloak.authServerUrl}/realms/${keycloak.realm}/protocol/openid-connect/token`

    const response = await fetch(tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'password',
        client_id: keycloak.clientId!,
        username,
        password,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('❌ Keycloak login error:', error)
      return false
    }

    const data = await response.json()

    // Keycloak instance'ına token'ları manuel olarak set et
    keycloak.token = data.access_token
    keycloak.refreshToken = data.refresh_token
    keycloak.idToken = data.id_token

    // Token'ı parse et
    keycloak.tokenParsed = JSON.parse(atob(data.access_token.split('.')[1]))
    keycloak.authenticated = true

    console.log('✅ Login successful:', keycloak.tokenParsed?.preferred_username)

    // Token refresh mekanizmasını başlat
    const refreshInterval = (data.expires_in - 30) * 1000 // 30 saniye önceden refresh
    setTimeout(() => {
      keycloak.updateToken(30).catch((err) => {
        console.error('Token refresh failed:', err)
      })
    }, refreshInterval)

    return true
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
}

/**
 * Keycloak initialization
 * Vue app mount etmeden once cagrilir
 */
export async function initKeycloak(app: App, router: Router): Promise<boolean> {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
    })

    console.log('Keycloak init complete, authenticated:', authenticated)

    app.mount('#app')

    if (authenticated) {
      console.log('User authenticated:', keycloak.tokenParsed?.preferred_username)
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      authStore.loadUserFromKeycloak()
    } else {
      console.log('No authentication, redirecting to /login')
      router.push('/login')
    }

    return authenticated
  } catch (err) {
    console.error('Keycloak init error:', err)
    return false
  }
}
