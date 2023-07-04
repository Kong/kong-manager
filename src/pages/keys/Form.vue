<template>
  <PageHeader
    :title="isEditing ? t('entities.key.editFormTitle') : t('entities.key.createFormTitle')"
  />
  <KeyForm
    :config="formConfig"
    :key-id="id"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeyForm } from '@kong-ui/entities-keys'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel, useFormRedirectOnUpdate } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import PageHeader from '@/components/PageHeader.vue'

defineOptions({
  name: 'KeyForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'key-detail', params: { id: id.value } }
    : { name: 'key-list' }
)

const routeOnUpdate = useFormRedirectOnUpdate(
  isEditing.value
    ? { name: 'key-detail', params: { id: id.value } }
    : { name: 'key-list' }
)

const formConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push(routeOnUpdate)
  toaster.open({
    appearance: 'success',
    message: t(isEditing.value ? 'entities.key.updated' : 'entities.key.created',
      { name: entity.name ?? entity.id }),
  })
}
</script>
