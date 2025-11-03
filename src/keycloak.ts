import Keycloak from 'keycloak-js'
import type { App } from 'vue'

export const keycloak = new Keycloak({
  url: 'http://localhost:7080',
  realm: 'master',
  clientId: 'vue-spa',
})

/**
 * Keycloak initialization
 * Vue app mount etmeden once cagrilir
 */
export async function initKeycloak(app: App): Promise<boolean> {
  try {
    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      pkceMethod: 'S256',
      checkLoginIframe: false,
      flow: 'standard',
      responseMode: 'query', // Hash yerine query string kullan
    })

    console.log('Keycloak init complete, authenticated:', authenticated)

    app.mount('#app')

    if (authenticated) {
      console.log('User authenticated:', keycloak.tokenParsed?.preferred_username)
      const { useAuthStore } = await import('@/stores/auth')
      const authStore = useAuthStore()
      authStore.loadUserFromKeycloak()

      // Callback sonrası URL'i temizle (query params kaldır)
      const url = new URL(window.location.href)
      if (url.searchParams.has('code') || url.searchParams.has('state')) {
        // Query params'leri temizle
        window.history.replaceState({}, document.title, url.pathname)
      }
    }

    return authenticated
  } catch (err) {
    console.error('Keycloak init error:', err)
    return false
  }
}
