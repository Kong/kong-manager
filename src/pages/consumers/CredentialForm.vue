<template>
  <PageHeader
    class="credential-form-header"
    :title="title"
  />
  <PluginForm
    :config="config"
    :plugin-type="credentialType"
    :plugin-id="credentialId"
    credential
    @error:fetch-schema="onFetchSchemaError"
    @update="onSave"
  />
</template>

<script setup lang="ts">
import type { AxiosError } from 'axios'
import { computed, reactive, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PluginForm } from '@kong-ui-public/entities-plugins'
import { useURLFromRouteQuery } from '@/composables/useRedirect'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useI18n } from '@/composables/useI18n'
import { useToaster } from '@/composables/useToaster'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toaster = useToaster()
const redirectPath = useURLFromRouteQuery('redirect')

const scopedEntityId = computed(() => route.params.id as string)
const credentialType = computed(() => route.params.pluginType as string)
const credentialId = computed(() => route.params?.credentialId as string)

const isEditing = computed(() => !!credentialId.value)
const title = computed(
  () => isEditing.value
    ? t('entities.consumer-credential.edit.form.title', { type: credentialType.value })
    : t('entities.consumer-credential.create.form.title', { type: credentialType.value }),
)

const cancelRoute = computed(() => {
  return redirectPath.value ?? { name: 'consumer-detail-credentials' }
})

const config = reactive({
  ...toRefs(useFormGeneralConfig()),
  cancelRoute,
  entityId: scopedEntityId,
})

const onFetchSchemaError = (err: AxiosError) => {
  if (err.response?.status === 404) {
    router.replace({ name: 'not-found' })
  }
}

const onSave = () => {
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

  if (redirectPath.value) {
    router.push(redirectPath.value ?? { name: 'consumer-detail-credentials' })
  }
}
</script>

<style scoped lang="scss">
.credential-form-header {
  margin-bottom: $kui-space-50;
}
</style>
