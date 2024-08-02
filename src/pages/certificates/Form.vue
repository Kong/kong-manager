<template>
  <PageHeader
    :title="isEditing ? t('entities.certificate.edit.form.title') : t('entities.certificate.create.form.title')"
  />
  <CertificateForm
    :config="certificateFormConfig"
    :certificate-id="id"
    show-snis-field
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { CertificateForm } from '@kong-ui-public/entities-certificates'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel, useFormRedirectOnUpdate } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'CertificateForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'certificate-detail', params: { id: id.value } }
    : { name: 'certificate-list' },
)

const routeOnUpdate = useFormRedirectOnUpdate(
  isEditing.value
    ? { name: 'certificate-detail', params: { id: id.value } }
    : { name: 'certificate-list' },
)

const certificateFormConfig = reactive({
  ...useFormGeneralConfig(),
  sniListRoute: { name: 'sni-list' },
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push(routeOnUpdate)
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.certificate.updated' : 'entities.certificate.created',
      { id: entity.id },
    ),
  })
}
</script>
