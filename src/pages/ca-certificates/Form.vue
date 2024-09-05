<template>
  <PageHeader
    :title="isEditing ? t('entities.ca-certificate.edit.form.title') : t('entities.ca-certificate.create.form.title')"
  />
  <CACertificateForm
    :config="caCertificateFormConfig"
    :certificate-id="id"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CACertificateForm } from '@kong-ui-public/entities-certificates'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'CACertificateForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'ca-certificate-detail', params: { id: id.value } }
    : { name: 'ca-certificate-list' },
)

const caCertificateFormConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push({ name: 'ca-certificate-detail', params: { id: entity.id || id.value } })
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.ca-certificate.updated' : 'entities.ca-certificate.created',
      { id: entity.id },
    ),
  })
}
</script>
