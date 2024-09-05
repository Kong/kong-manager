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
import { VaultForm } from '@kong-ui-public/entities-vaults'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { useGatewayFeatureSupported } from '@/composables/useGatewayFeatureSupported'

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
    : { name: 'vault-list' },
)

const vaultFormConfig = reactive({
  ...useFormGeneralConfig(),
  // azure vault is supported in Kong Gateway Enterprise 3.5
  azureVaultProviderAvailable: useGatewayFeatureSupported({
    enterprise: ['3.5'],
  }),
  // ttl fields are supported in Kong Gateway Enterprise 3.4
  ttl: useGatewayFeatureSupported({
    enterprise: ['3.4'],
  }),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push({ name: 'vault-detail', params: { id: entity.id || id.value } })
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.vault.updated' : 'entities.vault.created',
      { name: entity.prefix ?? entity.name ?? entity.id },
    ),
  })
}
</script>
