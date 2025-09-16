<template>
  <div class="user-menu">
    <div
      v-if="isAuthenticated"
      class="authenticated-user"
    >
      <div class="user-info">
        <div class="user-details">
          <div class="username">
            {{ user?.username }}
          </div>
          <div class="email">
            {{ user?.email }}
          </div>
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
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { user, isAuthenticated, logout } = useAuth()

const goToChangePassword = () => {
  router.push('/change-password')
}

const handleLogout = () => {
  logout()
  router.push('/login')
}
</script>

<style scoped lang="scss">
.user-menu {
  padding: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  margin-top: auto;
  background: transparent;
}

.authenticated-user {
  .user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;

    .user-avatar {
      width: 32px;
      height: 32px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      flex-shrink: 0;
    }

    .user-details {
      flex: 1;
      min-width: 0;

      .username {
        color: white;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .email {
        color: rgba(255, 255, 255, 0.7);
        font-size: 11px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }

  .user-actions {
    display: flex;
    flex-direction: column;
    gap: 6px;

    .action-button {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: white;
      padding: 6px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: all 0.2s;
      text-align: left;
      width: 100%;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      &.logout {
        color: #ff6b6b;
        border-color: rgba(255, 107, 107, 0.3);

        &:hover {
          background: rgba(255, 107, 107, 0.1);
        }
      }
    }
  }
}

// Sidebar footer için özel stiller
:deep(.kong-ui-app-sidebar-footer) {
  .user-menu {
    color: white;
    background: transparent;

    * {
      color: white;
    }
  }
}
</style>