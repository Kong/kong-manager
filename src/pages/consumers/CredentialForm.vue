<template>
  <PageHeader :title="title" />
  <NativeEntityForm
    :is-editing="isEditing"
    :show-confirmation-dialog="isEditing"
    :prevent-submission-before-change="isEditing"
    :resource-endpoint="resourceEndpoint"
    :schema="credentialPlugin.schema"
    :schema-endpoint="credentialPlugin.schemaEndpoint"
    :button-text="buttonText"
    :on-load="fetchRecord"
    :on-submit="onSubmit"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import NativeEntityForm from '@/components/EntityForm/NativeEntityForm.vue'
import { useAxios } from '@/composables/useAxios'
import { useAdminApiUrl } from '@/composables/useAdminApiUrl'
import { useI18n } from '@/composables/useI18n'
import { useToaster } from '@/composables/useToaster'
import CredentialPlugins from './CredentialPlugins'

const route = useRoute()
const router = useRouter()
const { axiosInstance } = useAxios()
const adminApiUrl = useAdminApiUrl()
const { t } = useI18n()
const toaster = useToaster()

const consumerId = computed(() => route.params?.id as string)
const pluginType = computed(() => route.params?.pluginType as string)
const credentialId = computed(() => route.params?.credentialId as string)
const credentialPlugin = computed(() => CredentialPlugins[pluginType.value] ?? {})
const isEditing = computed(() => !!credentialId.value)
const buttonText = computed(() => isEditing.value ? t('global.buttons.save') : t('global.buttons.create'))
const resourceEndpoint = computed(() => `consumers/${consumerId.value}${credentialPlugin.value.endpoint ?? ''}`)
const title = computed(
  () => isEditing.value
    ? t('entities.consumer-credential.edit.form.title', { type: pluginType.value })
    : t('entities.consumer-credential.create.form.title', { type: pluginType.value })
)

const onSuccess = () => {
  router.push(route.query.redirect as string ?? { name: 'consumer-detail-credentials' })
  if (isEditing.value) {
    toaster.open({
      appearance: 'success',
      message: t('entities.consumer-credential.updated'),
    })
  } else {
    toaster.open({
      appearance: 'success',
      message: t('entities.consumer-credential.created'),
    })
  }
}

const fetchRecord = () => {
  if (isEditing.value) {
    return axiosInstance.get(`${adminApiUrl}/${resourceEndpoint.value}/${credentialId.value}`)
  }
}

const createRecord = (model) => {
  axiosInstance
    .post(`${adminApiUrl}/${resourceEndpoint.value}`, model)
    .then(onSuccess)
}

const updateRecord = (model) => {
  axiosInstance
    .patch(`${adminApiUrl}/${resourceEndpoint.value}/${credentialId.value}`, model)
    .then(onSuccess)
}

const onSubmit = (model) => {
  return isEditing.value ? updateRecord(model) : createRecord(model)
}
</script>
