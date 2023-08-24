<template>
  <div class="plugin-ordering">
    <PageHeader
      :size="4"
      :title="t('entities.plugin.ordering.title')"
    >
      <KTooltip
        v-if="isConsumerPlugin"
        :label="t('entities.plugin.ordering.disabled')"
      >
        <KButton
          appearance="outline"
          data-testid="edit-ordering-button"
          disabled
        >
          {{ t('global.buttons.edit') }}
        </KButton>
      </KTooltip>
      <KButton
        v-else
        appearance="outline"
        data-testid="edit-ordering-button"
        @click="handleClick"
      >
        {{ t('global.buttons.edit') }}
      </KButton>
      <template #below-title>
        <SupportText>
          <span class="dynamic-doc-link">
            <i18n-t keypath="entities.plugin.doc.dynamic">
              <template #docLink>
                <KExternalLink :href="dynamicOrderingDocLink">
                  {{ t('global.learn.more') }}
                </KExternalLink>
              </template>
            </i18n-t>
          </span>
          <span>
            <i18n-t keypath="entities.plugin.doc.default">
              <template #docLink>
                <KExternalLink :href="defaultOrderingDocLink">
                  {{ t('global.learn.more') }}
                </KExternalLink>
              </template>
            </i18n-t>
          </span>
        </SupportText>
      </template>
    </PageHeader>
    <template v-if="hasOrdering">
      <div>
        <template
          v-for="token in tokens"
          :key="token.key"
        >
          <div class="plugin-ordering-token">
            {{ token.label }}
          </div>
          <template v-if="token.visible">
            <div class="plugin-ordering-phase">
              <img
                class="plugin-ordering-descendent"
                src="@/assets/icon-descendent.svg?external"
                alt=""
              >
              Access
            </div>
            <div
              v-for="(plugin, index) in (entity?.ordering ? entity.ordering[token.key].access : [])"
              :key="plugin"
              class="plugin-ordering-name"
              :class="{ 'is-first': index === 0 }"
            >
              <img
                v-if="index === 0"
                class="plugin-ordering-descendent"
                src="@/assets/icon-descendent.svg?external"
                alt=""
              >
              <PluginIcon
                :name="plugin"
                class="plugin-ordering-icon"
              />
              {{ plugin }}
            </div>
          </template>
          <template v-else>
            <PluginOrderingEmpty
              :disabled="isConsumerPlugin"
            />
          </template>
        </template>
      </div>
    </template>
    <PluginOrderingEmpty
      v-else
      :disabled="isConsumerPlugin"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { PluginIcon } from '@kong-ui-public/entities-plugins'
import PageHeader from '@/components/PageHeader.vue'
import SupportText from '@/components/SupportText.vue'
import { useDocsLink } from '@/composables/useDocsLink'
import { useI18n } from '@/composables/useI18n'
import { apiService } from '@/services/apiService'
import PluginOrderingEmpty from './PluginOrderingEmpty.vue'
import type { PluginSchema } from './types'

const entity = ref<PluginSchema | null>(null)

const id = computed(() => (route.params.id as string) ?? '')
const scopedEntityId = computed(() => (route.query?.entity_id ?? '') as string)
const scopedEntityType = computed(() => {
  if (!route.query?.entity_type) {
    return undefined
  }

  return `${(route.query?.entity_type as string).split('_')[0]}s`
})

const { docsBase } = useDocsLink()
const { t } = useI18n()
const dynamicOrderingDocLink = computed(() => `${docsBase.value}/kong-enterprise/plugin-ordering`)
const defaultOrderingDocLink = computed(() => `${docsBase.value}/plugin-development/custom-logic/#kong-plugins`)
const isConsumerPlugin = computed(() => !!entity.value?.consumer?.id)

const hasBefore = computed(() => !!entity.value?.ordering?.before?.access?.length)
const hasAfter = computed(() => !!entity.value?.ordering?.after?.access?.length)
const hasOrdering = computed(() => hasBefore.value || hasAfter.value)

const tokens = computed(() => [
  {
    key: 'before',
    label: 'Before',
    visible: hasBefore.value,
  },
  {
    key: 'after',
    label: 'After',
    visible: hasAfter.value,
  },
])

const route = useRoute()
const router = useRouter()
const handleClick = () => {
  router.push({
    name: 'plugin-ordering-update',
    params: { ...route.params },
    query: { ...route.query },
  })
}

onBeforeMount(async () => {
  const entityPath = scopedEntityType.value
    ? `${scopedEntityType.value}/${scopedEntityId.value}/plugins`
    : 'plugins'

  const { data } = await apiService.findRecord(entityPath, id.value)

  entity.value = data
})
</script>

<style scoped lang="scss">
.plugin-ordering {
  padding: $kui-space-80;
}
.dynamic-doc-link {
  margin-right: $kui-space-90;
}
.plugin-ordering-token {
  font-weight: bold;
  font-size: 16px;
  line-height: 50px;
  margin: 0;
  padding: 0 12px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);

  &:not(:first-child) {
    margin-top: 24px;
  }
}

.plugin-ordering-phase {
  font-weight: bold;
  font-size: 14px;
  line-height: 50px;
  margin: 0;
  padding: 0 12px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);
}

.plugin-ordering-descendent {
  height: 16px;
  width: 16px;
  margin-right: 12px;
}

.plugin-ordering-name {
  font-size: 14px;
  line-height: 50px;
  margin: 0;
  padding: 0 12px 0 64px;
  box-shadow: 0 1px 0 rgba(0, 0, 0, 0.1);

  &.is-first {
    padding-left: 36px;
  }
}

.plugin-ordering-icon {
  width: 16px;
  margin-right: 8px;
}
</style>
