<template>
  <PageHeader
    :title="isEditing ? t('entities.key.edit.form.title') : t('entities.key.create.form.title')"
  />
  <KeyForm
    :config="formConfig"
    :key-id="id"
    :fixed-key-set-id="keySetId"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeyForm } from '@kong-ui-public/entities-keys'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel, useFormRedirectOnUpdate } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'KeyForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const keySetId = computed(() => (route.query.keySetId as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'key-detail', params: { id: id.value } }
    : { name: 'key-list' },
)

const routeOnUpdate = useFormRedirectOnUpdate()

const formConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push(routeOnUpdate || { name: 'key-detail', params: { id: entity.id ?? '' } })
  toaster.open({
    appearance: 'success',
    message: t(isEditing.value ? 'entities.key.updated' : 'entities.key.created',
      { name: entity.name ?? entity.id }),
  })
}
</script>
