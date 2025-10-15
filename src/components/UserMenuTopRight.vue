<template>
  <div
    v-if="isAuthenticated"
    class="user-menu-top-right"
    ref="menuRef"
  >
    <div
      class="user-trigger"
      @click="toggleDropdown"
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
      <div class="dropdown-arrow">
        {{ isDropdownOpen ? '▲' : '▼' }}
      </div>
    </div>

    <!-- Dropdown Menu -->
    <div
      v-if="isDropdownOpen"
      class="dropdown-menu"
    >
      <div
        v-for="item in menuItems"
        :key="item.label"
        class="menu-item"
        :class="{ danger: item.danger }"
        @click="item.action"
      >
        <span class="menu-label">{{ item.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useAuth } from '@/composables/useAuth'

const { user, isAuthenticated, logout } = useAuth()

const isDropdownOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const userInitial = computed(() => {
  if (!user.value?.username) return 'U'
  return user.value.username.charAt(0).toUpperCase()
})

interface MenuItem {
  label: string
  action: () => void
  danger: boolean
}

const menuItems = computed<MenuItem[]>(() => [
  {
    label: 'Şifre Değiştir',
    action: () => {
      closeDropdown()
      // Keycloak account management sayfasını aç
      const accountUrl = 'http://localhost:7080/realms/master/account'
      window.open(accountUrl, '_blank')
    },
    danger: false,
  },
  {
    label: 'Çıkış Yap',
    action: () => {
      closeDropdown()
      logout()
      // Keycloak logout otomatik olarak redirect yapıyor, router.push'a gerek yok
    },
    danger: true,
  },
])

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

// Click outside handler
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    closeDropdown()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.user-menu-top-right {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #CA3433;
  font-weight: 700;
  font-size: 16px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .username {
    color: white;
    font-weight: 600;
    font-size: 14px;
    line-height: 1.2;
  }

  .email {
    color: rgba(255, 255, 255, 0.8);
    font-size: 12px;
    line-height: 1.2;
  }
}

.dropdown-arrow {
  color: white;
  font-size: 10px;
  margin-left: 4px;
  transition: transform 0.2s ease;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 16px;
  margin-top: 8px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: #f9fafb;
  }

  &.danger {
    &:hover {
      background: #fee2e2;
    }
  }
}

.menu-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  flex: 1;

  .menu-item.danger & {
    color: #CA3433;
  }
}
</style>
