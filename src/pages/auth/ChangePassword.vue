<template>
  <div class="change-password-page">
    <PageHeader title="Şifre Değiştir" />

    <div class="change-password-content">
      <div class="change-password-card">
        <div class="change-password-header">
          <h3>Şifre Değiştir</h3>
          <p>Mevcut şifrenizi girin ve yeni şifrenizi belirleyin</p>
        </div>

        <form
          @submit.prevent="handleChangePassword"
          class="change-password-form"
        >
          <div class="form-group">
            <label for="currentPassword">Mevcut Şifre</label>
            <input
              id="currentPassword"
              v-model="formData.currentPassword"
              type="password"
              placeholder="Mevcut şifrenizi girin"
              autocomplete="current-password"
              required
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="newPassword">Yeni Şifre</label>
            <input
              id="newPassword"
              v-model="formData.newPassword"
              type="password"
              placeholder="Yeni şifrenizi girin"
              autocomplete="new-password"
              required
              class="form-input"
            >
          </div>

          <div class="form-group">
            <label for="confirmPassword">Şifre Onayı</label>
            <input
              id="confirmPassword"
              v-model="formData.confirmPassword"
              type="password"
              placeholder="Şifrenizi tekrar girin"
              autocomplete="new-password"
              required
              class="form-input"
            >
          </div>

          <div class="form-actions">
            <KButton
              type="button"
              appearance="secondary"
              @click="goBack"
            >
              İptal
            </KButton>
            <KButton
              type="submit"
              appearance="primary"
              :loading="isLoading"
            >
              Şifreyi Değiştir
            </KButton>
          </div>
        </form>

        <div
          v-if="errorMessage"
          class="error-message"
        >
          {{ errorMessage }}
        </div>

        <div
          v-if="successMessage"
          class="success-message"
        >
          {{ successMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import { KButton } from '@kong/kongponents'
import PageHeader from '@/components/PageHeader.vue'

defineOptions({
  name: 'ChangePasswordPage',
})

const router = useRouter()
const { changePassword } = useAuth()

const isLoading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const formData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const validateForm = () => {
  if (formData.newPassword.length < 6) {
    errorMessage.value = 'Yeni şifre en az 6 karakter olmalıdır'
    return false
  }

  if (formData.newPassword !== formData.confirmPassword) {
    errorMessage.value = 'Yeni şifreler eşleşmiyor'
    return false
  }

  return true
}

const handleChangePassword = async () => {
  isLoading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  if (!validateForm()) {
    isLoading.value = false
    return
  }

  try {
    const success = await changePassword(formData.currentPassword, formData.newPassword)

    if (success) {
      successMessage.value = 'Şifreniz başarıyla değiştirildi'
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      errorMessage.value = 'Mevcut şifre hatalı'
    }
  } catch (error) {
    errorMessage.value = 'Şifre değiştirilirken bir hata oluştu'
    console.error('Change password error:', error)
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.back()
}
</script>

<style scoped lang="scss">
.change-password-page {
  background: white;
  min-height: 100vh;
}

.change-password-content {
  padding: 32px 40px;
  max-width: 600px;
  margin: 0 auto;
}

.change-password-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 32px;
  border: 1px solid #e1e5e9;
}

.change-password-header {
  text-align: center;
  margin-bottom: 32px;

  h3 {
    color: #333;
    margin-bottom: 8px;
    font-size: 24px;
    font-weight: 600;
  }

  p {
    color: #666;
    margin: 0;
    font-size: 16px;
  }
}

.change-password-form {
  .form-group {
    margin-bottom: 24px;

    label {
      display: block;
      margin-bottom: 8px;
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
    display: flex;
    gap: 12px;
    justify-content: center;
    margin-top: 32px;
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

.success-message {
  background: #efe;
  color: #3c3;
  padding: 12px;
  border-radius: 6px;
  margin-top: 20px;
  text-align: center;
  font-size: 14px;
}
</style>