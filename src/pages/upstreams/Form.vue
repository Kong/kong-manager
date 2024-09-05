<template>
  <PageHeader
    :title="isEditing ? t('entities.upstream.edit.form.title') : t('entities.upstream.create.form.title')"
  />
  <UpstreamsForm
    :config="upstreamFormConfig"
    :upstream-id="id"
    @update="handleUpdate"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UpstreamsForm } from '@kong-ui-public/entities-upstreams-targets'
import { useFormGeneralConfig } from '@/composables/useFormGeneralConfig'
import { useFormRedirectOnCancel } from '@/composables/useFormRedirect'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'UpstreamForm',
})

const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const isEditing = computed(() => !!id.value)

const routeOnCancel = useFormRedirectOnCancel(
  isEditing.value
    ? { name: 'upstream-detail', params: { id: id.value } }
    : { name: 'upstream-list' },
)

const upstreamFormConfig = reactive({
  ...useFormGeneralConfig(),
  cancelRoute: routeOnCancel,
})

const handleUpdate = (entity) => {
  router.push({ name: 'upstream-detail', params: { id: entity.id || id.value } })
  toaster.open({
    appearance: 'success',
    message: t(
      isEditing.value ? 'entities.upstream.updated' : 'entities.upstream.created',
      { name: entity.name ?? entity.id },
    ),
  })
}
</script>
