<template>
  <PageHeader
    :title="isEditing ? t('entities.consumer.edit.form.title') : t('entities.consumer.create.form.title')"
  />
  <ConsumerForm
    :config="consumerFormConfig"
    :consumer-id="id"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ConsumerForm } from '@kong-ui-public/entities-consumers'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'ConsumerForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'consumer-detail', params: { id: id.value } }
    : { name: 'consumer-list' },
)

const consumerFormConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push({ name: 'consumer-detail', params: { id: entity.id || id.value } })
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.consumer.updated' : 'entities.consumer.created',
      { name: entity.username ?? entity.custom_id },
    ),
  })
}
</script>
