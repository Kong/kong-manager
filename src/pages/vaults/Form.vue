<template>
  <PageHeader
    :title="isEditing ? t('entities.vault.edit.form.title') : t('entities.vault.create.form.title')"
  />
  <VaultForm
    :config="vaultFormConfig"
    :vault-id="id"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { VaultForm } from '@kong-ui/entities-vaults'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel, useFormRedirectOnUpdate } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'VaultForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'vault-detail', params: { id: id.value } }
    : { name: 'vault-list' }
)

const routeOnUpdate = useFormRedirectOnUpdate(
  isEditing.value
    ? { name: 'vault-detail', params: { id: id.value } }
    : { name: 'vault-list' }
)

const vaultFormConfig = reactive({
  ...useFormGeneralConfig(),
  azureVaultProviderAvailable: false,
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push(routeOnUpdate)
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.vault.updated' : 'entities.vault.created',
      { name: entity.name ?? entity.id },
    ),
  })
}
</script>