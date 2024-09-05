<template>
  <PageHeader
    :title="isEditing ? t('entities.sni.edit.form.title') : t('entities.sni.create.form.title')"
  />
  <SniForm
    :config="sniFormConfig"
    :sni-id="id"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { SniForm } from '@kong-ui-public/entities-snis'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel, useFormRedirectOnUpdate } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'SniForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel({ name: 'sni-list' })

const routeOnUpdate = useFormRedirectOnUpdate({ name: 'sni-list' })

const sniFormConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push(routeOnUpdate!)
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.sni.updated' : 'entities.sni.created',
      { name: entity.name },
    ),
  })
}
</script>
