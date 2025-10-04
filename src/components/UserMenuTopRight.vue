<template>
  <div
    v-if="isAuthenticated"
    class="user-menu-top-right"
  >
    <div class="user-avatar">
      {{ userInitial }}
    </div>
    <div class="user-info">
      <div class="username">
        {{ user?.username }}
      </div>
      <div class="email">
        {{ user?.email }}
      </div>
    </div>
    <div class="user-actions">
      <button
        @click="goToChangePassword"
        class="action-button"
      >
        Şifre Değiştir
      </button>
      <button
        @click="handleLogout"
        class="action-button logout"
      >
        Çıkış
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()

const userInitial = computed(() => {
  if (!user.value?.username) return 'U'
  return user.value.username.charAt(0).toUpperCase()
})

const goToChangePassword = () => {
  router.push('/change-password')
}

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>
