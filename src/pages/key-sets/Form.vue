<template>
  <PageHeader
    :title="isEditing ? t('entities.key-set.edit.form.title') : t('entities.key-set.create.form.title')"
  />
  <KeySetForm
    :config="formConfig"
    :key-set-id="id"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeySetForm } from '@kong-ui-public/entities-key-sets'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'KeySetForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'key-set-detail', params: { id: id.value } }
    : { name: 'key-set-list' },
)

const formConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push({ name: 'key-set-detail', params: { id: entity.id || id.value } })
  toaster.open({
    appearance: 'success',
    message: t(isEditing.value ? 'entities.key-set.updated' : 'entities.key-set.created',
      { name: entity.name ?? entity.id }),
  })
}
</script>
