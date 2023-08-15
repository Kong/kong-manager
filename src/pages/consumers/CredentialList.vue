<template>
  <section
    v-if="enabled"
    class="credential-list-wrapper"
  >
    <PageHeader
      :title="title"
      :size="5"
    />
    <ConsumerCredentialList
      :cache-identifier="cacheIdentifier"
      :config="credentialListConfig"
      :can-create="canCreate"
      :can-delete="canDelete"
      :can-edit="canEdit"
      @copy:success="onCopySuccess"
      @copy:error="onCopyError"
      @delete:success="onDeleteSuccess"
    />
  </section>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRoute } from 'vue-router'
import { ConsumerCredentialList, type CredentialPlugins } from '@kong-ui-public/entities-consumer-credentials'
import PageHeader from '@/components/PageHeader.vue'
import { useListGeneralConfig } from '@/composables/useListGeneralConfig'
import { useListRedirect } from '@/composables/useListRedirect'
import { useCopyEventHandlers } from '@/composables/useCopyEventHandlers'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'

const props = defineProps({
  enabled: {
    type: Boolean,
    default: false,
  },

  title: {
    type: String,
    default: '',
  },

  pluginType: {
    type: String,
    default: '',
  },
})

const route = useRoute()
const toaster = useToaster()
const { t } = useI18n()

const consumerId = computed(() => route.params?.id as string)
const cacheIdentifier = computed(() => `credentials-${consumerId.value}-${props.pluginType}`)

const { createRedirectRouteQuery } = useListRedirect()

const pluginName = computed(() => props.pluginType === 'acl' ? 'acls' : props.pluginType)

const createRoute = computed(() => {
  return {
    name: 'consumer-detail-credentials-create',
    params: {
      id: consumerId.value,
      pluginType: props.pluginType,
    },
    query: createRedirectRouteQuery(),
  }
})

const getEditRoute = (id: string) => {
  return {
    name: 'consumer-detail-credentials-edit',
    params: {
      id: consumerId.value,
      credentialId: id,
      pluginType: props.pluginType,
    },
    query: createRedirectRouteQuery(),
  }
}

const credentialListConfig = reactive({
  ...useListGeneralConfig(),
  consumerId: consumerId.value,
  plugin: pluginName.value as CredentialPlugins,
  createRoute,
  getEditRoute,
})

const canCreate = async () => true

const canDelete = async () => true

const canEdit = async () => true

const { onCopySuccess, onCopyError } = useCopyEventHandlers()

const onDeleteSuccess = () => {
  toaster.open({
    appearance: 'success',
    message: t('entities.consumer-credential.deleted'),
  })
}
</script>

<style scoped lang="scss">
.credential-list-wrapper {
  margin-top: 30px;
}
</style>
