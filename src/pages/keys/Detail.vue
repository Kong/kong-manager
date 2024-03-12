<template>
  <PageHeader :title="t('entities.key.detail.title', { name: titleName })">
    <HeaderBackButton entity="key" />
    <HeaderEditButton
      class="button-edit"
      entity="key"
    />
  </PageHeader>
  <KeyConfigCard
    :config="keyDetailConfig"
    :key-set-id="keySetId"
    @fetch:success="onFetchSuccess"
    @navigation-click="onNavigationClick"
  />
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { KeyConfigCard } from '@kong-ui-public/entities-keys'
import { useDetailGeneralConfig } from '@/composables/useDetailGeneralConfig'
import { useI18n } from '@/composables/useI18n'

defineOptions({
  name: 'KeyDetail',
})

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const id = computed(() => (route.params.id as string) ?? '')
const keySetId = computed(() => (route.query.keySetId as string) ?? '')

const titleName = ref<string>('')

const keyDetailConfig = reactive({
  ...useDetailGeneralConfig(),
  entityId: id.value,
})

const onNavigationClick = (id: string) => {
  router.push({
    name: 'key-set-detail',
    params: { id },
  })
}

const onFetchSuccess = (entity) => {
  titleName.value = entity.name ?? entity.id
}
</script>

<style lang="scss" scoped>
.button-edit {
  margin-left: $kui-space-60;
}
</style>
