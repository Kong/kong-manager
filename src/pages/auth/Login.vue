<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-logo">
        <img
          src="@/assets/apiruler-logo.svg"
          alt="ApiRuler Logo"
          class="logo-image"
        >
      </div>
      <div class="login-header">
        <h2>ApiRuler Manager</h2>
        <p>Lütfen giriş yapın</p>
      </div>

      <form
        @submit.prevent="handleLogin"
        class="login-form"
      >
        <div class="form-group">
          <label for="username">Kullanıcı Adı</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            placeholder="admin"
            autocomplete="username"
            required
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="password">Şifre</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            placeholder="admin123"
            autocomplete="current-password"
            required
            class="form-input"
          >
        </div>

        <div class="form-actions">
          <KButton
            type="submit"
            appearance="primary"
            :loading="isLoading"
            size="large"
          >
            Giriş Yap
          </KButton>
        </div>
      </form>

      <div
        v-if="errorMessage"
        class="error-message"
      >
        {{ errorMessage }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { KButton } from '@kong/kongponents'

defineOptions({
  name: 'LoginPage',
})

const router = useRouter()
const { login } = useAuth()

const isLoading = ref(false)
const errorMessage = ref('')

const formData = reactive({
  username: '',
  password: '',
})

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const success = await login(formData.username, formData.password)
    console.log('Login success:', success)

    if (success) {
      console.log('Redirecting to home...')
      router.push('/')
    } else {
      errorMessage.value = 'Kullanıcı adı veya şifre hatalı'
    }
  } catch (error) {
    errorMessage.value = 'Giriş yapılırken bir hata oluştu'
    console.error('Login error:', error)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #CA3433;
  padding: 20px;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  width: 100vw;
  height: 100vh;
}

.login-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 400px;
}

.login-logo {
  text-align: center;
  margin-bottom: 30px;

  .logo-image {
    width: 100%;
    max-width: 280px;
    height: auto;
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;

  h2 {
    color: #333;
    margin-bottom: 8px;
    font-size: 28px;
    font-weight: 600;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 16px;
  }
}

.login-form {
  .form-group {
    margin-bottom: 20px;

    label {
      display: block;
      margin-bottom: 6px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }

    .form-input {
      width: 100%;
      padding: 12px 16px;
      border: 1px solid #ddd;
      border-radius: 6px;
      font-size: 16px;
      transition: border-color 0.2s ease;

      &:focus {
        outline: none;
        border-color: #CA3433;
        box-shadow: 0 0 0 3px rgba(202, 52, 51, 0.1);
      }

      &::placeholder {
        color: #999;
      }
    }
  }

  .form-actions {
    margin-top: 30px;
    text-align: center;
  }
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}
</style>