<template>
  <section class="plugins-ordering-form">
    <PageHeader title="Edit dynamic ordering">
      <template #below-title>
        <p class="ordering-form-link">
          <i18n-t keypath="entities.plugin.doc.dynamic">
            <template #docLink>
              <KExternalLink :href="dynamicOrderingDocLink">
                {{ t('global.learn.more') }}
              </KExternalLink>
            </template>
          </i18n-t>
        </p>
        <p class="ordering-form-link">
          <i18n-t keypath="entities.plugin.doc.default">
            <template #docLink>
              <KExternalLink :href="defaultOrderingDocLink">
                {{ t('global.learn.more') }}
              </KExternalLink>
            </template>
          </i18n-t>
        </p>
      </template>
    </PageHeader>
    <div
      v-for="token in tokens"
      :key="token.key"
      :data-testid="`plugin-ordering-${token.key}`"
    >
      <h3 class="ordering-token">
        {{ token.label }}
      </h3>
      <p class="ordering-token-desc">
        {{ token.desc }}
      </p>
      <template
        v-for="(plugin, i) in token.orderings"
        :key="plugin"
      >
        <label
          class="ordering-plugin-label"
          :for="`${token.key}-${i}`"
        >
          {{ t('entities.plugin.ordering.plugin.label', { index: i + 1 }) }}
        </label>
        <div
          class="ordering-plugin-select"
          :data-testid="`${token.key}-${i}`"
        >
          <KSelect
            :id="`${token.key}-${i}`"
            :model-value="ordering[token.key].access[i]"
            appearance="select"
            enable-filtering
            :items="getSelectOptions(token.key, i)"
            @update:model-value="(val) => { onSelect(token.key, i, val as string) }"
          />
          <KButton
            appearance="btn-link"
            class="delete"
            @click="() => { onRemovePlugin(token.key, i) }"
          >
            <template #icon>
              <KIcon
                icon="trash"
                size="18"
              />
            </template>
          </KButton>
        </div>
      </template>
      <KButton
        class="ordering-plugin-add"
        appearance="btn-link"
        @click="() => { onAddPlugin(token.key) }"
      >
        {{ t('entities.plugin.ordering.add.plugin') }}
      </KButton>
    </div>
    <KAlert
      v-if="error"
      :alert-message="error"
      appearance="danger"
    />
    <div class="ordering-form-footer">
      <KButton
        appearance="primary"
        @click="onUpdate"
      >
        {{ t('global.buttons.update') }}
      </KButton>
      <KButton
        appearance="outline"
        class="cancel"
        @click="onCancel"
      >
        {{ t('global.buttons.cancel') }}
      </KButton>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { AxiosError } from 'axios'
import { computed, onBeforeMount, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import PageHeader from '@/components/PageHeader.vue'
import { apiService } from '@/services/apiService'
import { getMessageFromError } from '@/utils'
import { useToaster } from '@/composables/useToaster'
import { useI18n } from '@/composables/useI18n'
import { useDocsLink } from '@/composables/useDocsLink'
import { pluginMeta } from './PluginMeta'
import type { Ordering } from './types'

const { docsBase } = useDocsLink()
const route = useRoute()
const router = useRouter()
const toaster = useToaster()
const { t } = useI18n()

const dynamicOrderingDocLink = computed(() => `${docsBase.value}/kong-enterprise/plugin-ordering`)
const defaultOrderingDocLink = computed(() => `${docsBase.value}/plugin-development/custom-logic/#kong-plugins`)

const pluginOptions = ref<Array<{ label: string, value: string }>>([])
const ordering = ref<Ordering>({})
const error = ref<string>('')

const resourceEndpoint = computed(() => {
  const { entity_type, entity_id } = route.query
  if (!entity_type) {
    return 'plugins'
  }

  return `${(entity_type as string).split('_')[0]}s/${entity_id}/plugins`
})

const tokens = computed(() => [
  {
    label: t('entities.plugin.ordering.before.label'),
    key: 'before',
    desc: t('entities.plugin.ordering.before.desc'),
    orderings: ordering.value.before?.access || [],
  },
  {
    label: t('entities.plugin.ordering.after.label'),
    key: 'after',
    desc: t('entities.plugin.ordering.after.desc'),
    orderings: ordering.value.after?.access || [],
  },
])

// disable plugin options if they are already selected
const getSelectOptions = (key: string, index: number) => pluginOptions.value
  .map((option) => {
    const isSelf = option.value === route.params.pluginType
    const isSelected = [...ordering.value.before?.access ?? [], ...ordering.value.after?.access ?? []]
      .some(plugin => {
        return (plugin === option.value && plugin !== ordering.value[key].access[index])
      })

    return {
      ...option,
      disabled: isSelf || isSelected,
    }
  })

const onSelect = (key: string, i: number, val: string) => {
  ordering.value[key].access[i] = val
}

const onRemovePlugin = (key: string, i: number) => {
  ordering.value[key].access.splice(i, 1)
}

const onAddPlugin = (key: string) => {
  if (!ordering.value[key]) {
    ordering.value[key] = { access: [] }
  }

  ordering.value[key].access.push('')
}

const onUpdate = async () => {
  const filteredOrdering: Ordering = {}
  const before = ordering.value.before?.access?.filter(Boolean) || []
  const after = ordering.value.after?.access?.filter(Boolean) || []

  if (before.length) {
    filteredOrdering.before = { access: before }
  }

  if (after.length) {
    filteredOrdering.after = { access: after }
  }

  try {
    await apiService.updateRecord(
      resourceEndpoint.value,
      route.params.id as string,
      { ordering: before.length || after.length ? filteredOrdering : null }
    )
  } catch (err) {
    error.value = getMessageFromError(err as AxiosError<{ message?: string }>)

    return
  }

  error.value = ''
  toaster.open({
    appearance: 'success',
    message: t('entities.plugin.ordering.updated'),
  })
  router.push({
    name: 'plugin-ordering',
    params: { ...route.params },
  })
}

const onCancel = () => {
  router.push({
    name: 'plugin-ordering',
    params: { ...route.params },
  })
}

onBeforeMount(async () => {
  const { data: record } = await apiService.findRecord('plugins', route.params.id as string)

  ordering.value = record.ordering ?? {}

  const { data: config } = await apiService.get()

  pluginOptions.value = Object.keys(config.plugins?.available_on_server ?? {})
    .filter(key => pluginMeta[key])
    .map(key => ({
      label: pluginMeta[key].name,
      value: key,
    }))
    .sort((a, b) => a.label.localeCompare(b.label))
})
</script>

<style lang="scss" scoped>
.plugins-ordering-form {
  margin: 0 auto;
  width: 60%;
}

.ordering-form-link {
  display: flex;
  font-size: 14px;
  line-height: 26px;
  color: rgba(0, 0, 0, 0.45);
  margin: 0 0 $kui-space-40;

  &:last-child {
    margin-bottom: 0;
  }
}

.ordering-token {
  font-weight: 500;
  font-size: 18px;
  line-height: 26px;
  margin: $kui-space-100 0 0;
  color: #000;
}

.ordering-token-desc {
  font-size: 14px;
  line-height: 20px;
  color: rgba(0, 0, 0, 0.4);
  margin: $kui-space-40 0 0;
}

.ordering-plugin-label {
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;
  color: #262626;
  margin: $kui-space-80 0 $kui-space-40;
}

.ordering-plugin-select {
  display: flex;
  align-items: center;

  .k-select {
    flex: 1;
  }

  .delete {
    margin-left: $kui-space-80;
  }
}

.ordering-plugin-add {
  margin: $kui-space-80 0 $kui-space-50;
}

.ordering-form-footer {
  margin-top: $kui-space-70;

  .cancel {
    margin-left: $kui-space-60;
  }
}
</style>
