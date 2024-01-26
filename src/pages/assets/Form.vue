<template>
  <PageHeader
    :title="isEditing ? t('entities.asset.edit.form.title') : t('entities.asset.create.form.title')"
  />
  <AssetForm
    :config="assetFormConfig"
    :asset-id="id"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel, useFormRedirectOnUpdate } from '@/composables/useFormRedirect'
import { useI18n } from '@/composables/useI18n'
import { useToaster } from '@/composables/useToaster'
import { AssetForm } from '@kong-ui-public/entities-assets'
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'

defineOptions({
  name: 'AssetForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel({ name: 'asset-list' })

const routeOnUpdate = useFormRedirectOnUpdate({ name: 'asset-list' })

const assetFormConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push(routeOnUpdate)
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.asset.updated' : 'entities.asset.created',
      { name: entity.name },
    ),
  })
}
</script>
