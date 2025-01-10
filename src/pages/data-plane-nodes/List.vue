<template>
  <section class="page-data-plane-nodes">
    <PageHeader :title="t('entities.dp-nodes.list.title')" />
    <KCard>
      <KTable
        :key="tableKey"
        :headers="headers"
        empty-state-icon-variant="kong"
        :empty-state-message="t('entities.dp-nodes.empty.message')"
        :empty-state-title="t('entities.dp-nodes.empty.title')"
        :error-state-message="errorMessage"
        :error-state-title="t('entities.dp-nodes.error.title')"
        :fetcher="fetcher"
        :error="!!errorMessage"
        pagination-offset
      >
        <template #toolbar>
          <KDropdown v-if="visibleNodes.length">
            <KButton
              appearance="secondary"
              :disabled="!selectedNodeCount"
            >
              {{
                t('entities.dp-nodes.bulk.actions.placeholder', {
                  count: selectedNodeCount ? `(${selectedNodeCount}) ` : '',
                })
              }}
              <ChevronDownIcon />
            </KButton>
            <template #items>
              <KDropdownItem
                data-testid="dropdown-item-change-log-level"
                @click="openLogLevelEditModal"
              >
                {{ t('entities.dp-nodes.bulk.actions.change.log.level') }}
              </KDropdownItem>
            </template>
          </KDropdown>
        </template>

        <template #column-selection>
          <KCheckbox
            :model-value="isAllVisibleNodesSelected"
            :indeterminate="isSomeVisibleNodesSelected"
            @change="onGlobalSelectionChange"
          />
        </template>

        <template #selection="{ row }">
          <KCheckbox
            :model-value="row.selected"
            @change="onRowSelectionChange(row.id)"
          />
        </template>

        <template #hostname="{ rowValue }">
          <b>{{ rowValue }}</b>
        </template>

        <template #last_seen="{ rowValue }">
          <span v-if="rowValue">
            {{ formatDate(rowValue) }}
          </span>
          <span v-else>-</span>
        </template>

        <template #cert_details="{ rowValue }">
          <span v-if="rowValue?.expiry_timestamp">
            {{ formatDate(rowValue.expiry_timestamp) }}
          </span>
          <span v-else>-</span>
        </template>

        <template #log_level="{ row }">
          <div
            v-if="nodeLogLevel[row.id]"
            class="node-log-level-container"
          >
            <KBadge appearance="info">
              {{ capitalize(nodeLogLevel[row.id].current_level) }}
            </KBadge>
            <KTooltip
              v-if="nodeLogLevel[row.id].current_level !== nodeLogLevel[row.id].original_level"
              max-width="180"
              :text="t('entities.dp-nodes.tooltips.revert', {
                level: capitalize(nodeLogLevel[row.id].original_level),
                time: formatDateFromTimeout(nodeLogLevel[row.id].timeout),
              })"
            >
              <InfoIcon
                :color="KUI_COLOR_BACKGROUND_NEUTRAL"
                :size="KUI_ICON_SIZE_30"
              />
            </KTooltip>
          </div>

          <!-- TODO: add doc link to the tooltip content -->
          <KTooltip
            v-else-if="!row.hasDLLCapability"
            :text="t('entities.dp-nodes.tooltips.not.supported')"
          >
            <KBadge appearance="info">
              {{ t('entities.dp-nodes.not.applicable') }}
            </KBadge>
          </KTooltip>

          <ProgressIcon
            v-else
            :color="KUI_COLOR_TEXT_NEUTRAL"
          />
        </template>

        <template #labels="{ rowValue }">
          <KTruncate v-if="Object.keys(rowValue).length > 0">
            <KBadge
              v-for="(val, key) in rowValue"
              :key="key"
              appearance="neutral"
              :tooltip="`${key}: ${val}`"
              truncation-tooltip
              @click.stop
            >
              {{ key }}: {{ val }}
            </KBadge>
          </KTruncate>
          <span v-else>-</span>
        </template>

        <template #actions="{ row }">
          <KDropdown :kpop-attributes="{ placement: 'bottom-end' }">
            <KButton
              appearance="tertiary"
              class="actions-trigger"
              icon
              size="small"
            >
              <MoreIcon />
            </KButton>
            <template #items>
              <KClipboardProvider v-slot="{ copyToClipboard }">
                <KDropdownItem @click="copyId(row, copyToClipboard)">
                  {{ t('entities.dp-nodes.copy.id') }}
                </KDropdownItem>
              </KClipboardProvider>
            </template>
          </KDropdown>
        </template>
      </KTable>
    </KCard>

    <ChangeLogLevelModal
      v-model:visible="modalVisible"
      :instance-list="visibleNodes.filter(node => node.selected)"
      :instance-log-level="nodeCurrentLogLevel"
      :requests="{
        scheduler: { maxConcurrentAsyncs },
        getDataPlaneLogLevel: getNodeLogLevel,
        setDataPlaneLogLevel: setNodeLogLevel,
      }"
    />
  </section>
</template>

<script setup lang="ts">
import type { AxiosError } from 'axios'
import { computed, ref, watch } from 'vue'
import {
  KUI_COLOR_TEXT_NEUTRAL,
  KUI_ICON_SIZE_30,
  KUI_COLOR_BACKGROUND_NEUTRAL,
} from '@kong/design-tokens'
import { ProgressIcon, InfoIcon, ChevronDownIcon, MoreIcon } from '@kong/icons'
import type { TableDataFetcherParams } from '@kong/kongponents'
import type { LogLevel } from '@kong-ui-public/entities-data-plane-nodes'
import { ChangeLogLevelModal, composables } from '@kong-ui-public/entities-data-plane-nodes'
import { capitalize, formatDate } from '@/utils'
import { apiService } from '@/services/apiService'
import { useI18n } from '@/composables/useI18n'
import { useToaster } from '@/composables/useToaster'

interface DataPlaneNodeResponse {
  id: string
  hostname: string
  version: string
  last_seen: string
  rpc_capabilities?: Array<string>
  cert_details: {
    expiry_timestamp: number
  }
  sync_status: string
  labels: Record<string, string>
}

interface DataPlaneNode extends DataPlaneNodeResponse {
  hasDLLCapability: boolean
  selected: boolean
}

interface LogLevelResponse {
  current_level: LogLevel
  original_level: LogLevel
  timeout: number
}

defineOptions({ name: 'DataPlaneNodeList' })

const maxConcurrentAsyncs = 5
const requestScheduler = composables.useAsyncScheduler({ maxConcurrentAsyncs })
const toaster = useToaster()
const { t } = useI18n()

const headers = [
  { hideLabel: true, key: 'selection' },
  { label: t('entities.dp-nodes.headers.hostname'), key: 'hostname' },
  { label: t('entities.dp-nodes.headers.version'), key: 'version' },
  { label: t('entities.dp-nodes.headers.last.seen'), key: 'last_seen' },
  { label: t('entities.dp-nodes.headers.sync.status'), key: 'sync_status' },
  { label: t('entities.dp-nodes.headers.cert.expires.at'), key: 'cert_details' },
  { label: t('entities.dp-nodes.headers.log.level'), key: 'log_level' },
  { label: t('entities.dp-nodes.headers.labels'), key: 'labels' },
  { hideLabel: true, key: 'actions' },
]

const tableKey = ref<number>(0)
const visibleNodes = ref<Array<DataPlaneNode>>([])
const errorMessage = ref<string>('')
const modalVisible = ref<boolean>(false)
const nodeLogLevel = ref<Record<string, LogLevelResponse>>({})
const hasLogLevelChanged = ref<boolean>(false) // if some log level has been changed

const nodeCurrentLogLevel = computed<Map<string, LogLevel>>(() => {
  return Object.keys(nodeLogLevel.value).reduce((acc, id) => {
    acc.set(id, nodeLogLevel.value[id].current_level)

    return acc
  }, new Map())
})
const selectedNodeCount = computed<number>(() => {
  return visibleNodes.value.filter(node => node.selected).length
})
const isAllVisibleNodesSelected = computed<boolean>(() => {
  return selectedNodeCount.value === visibleNodes.value.length
})
const isSomeVisibleNodesSelected = computed<boolean>(() => {
  return selectedNodeCount.value > 0 && selectedNodeCount.value < visibleNodes.value.length
})

const fetcher = async (props: TableDataFetcherParams) => {
  errorMessage.value = ''
  requestScheduler.cancelAll()

  const {
    page,
    pageSize,
    offset,
  } = props

  try {
    const { data } = await apiService.findAll<{ data: DataPlaneNodeResponse[], offset?: number }>(
      'clustering/data-planes',
      {
        size: pageSize,
        offset: page === 1 ? undefined : offset,
      },
    )

    visibleNodes.value = data.data.map(node => ({
      ...node,
      hasDLLCapability: node.rpc_capabilities?.includes?.('kong.debug.log_level.v1') ?? false,
      selected: false,
    }))
    scheduleLogLevelRequests()

    return {
      data: visibleNodes.value,
      ...(data.offset
        ? {
          pagination: {
            offset: data.offset,
          },
        }
        : null),
    }
  } catch (err) {
    const { response } = err as AxiosError<{ message: string }>

    errorMessage.value = response?.data?.message || t('entities.dp-nodes.error.fetch.fail')
  }
}

const scheduleLogLevelRequests = () => {
  visibleNodes.value.forEach(async node => {
    if (!node.hasDLLCapability) {
      return
    }

    try {
      await requestScheduler.schedule(() => {
        return getNodeLogLevel(node.id)
      })
    } catch (err) {
      if (err instanceof composables.AsyncAbortException) {
        return
      }

      console.error(err)
    }
  })
}

const onGlobalSelectionChange = () => {
  const val = !isAllVisibleNodesSelected.value

  visibleNodes.value.forEach(node => {
    node.selected = val
  })
}

const onRowSelectionChange = (id: string) => {
  const target = visibleNodes.value.find(node => node.id === id)
  if (target) {
    target.selected = !target.selected
  }
}

const formatDateFromTimeout = (timeout: number) => {
  return formatDate(Date.now() / 1000 + timeout, 'MMM DD, YYYY, h:mm:ss A')
}

const openLogLevelEditModal = () => {
  modalVisible.value = true
}

const getNodeLogLevel = async (id: string) => {
  try {
    const response = await apiService.get<LogLevelResponse>(`clustering/data-planes/${id}/log-level`)

    nodeLogLevel.value[id] = response.data

    return response.data.current_level
  } catch (err) {
    const target = visibleNodes.value.find(node => node.id === id)

    toaster.open({
      appearance: 'danger',
      message: t('entities.dp-nodes.error.get.log.level.fail', { id: target?.hostname ?? id }),
    })

    throw err
  }
}

const setNodeLogLevel = async (id: string, logLevel: LogLevel, revertAfter: number) => {
  const target = visibleNodes.value.find(node => node.id === id)
  if (target) {
    await apiService.put(
      `clustering/data-planes/${id}/log-level`,
      { current_level: logLevel, timeout: revertAfter },
    )
    hasLogLevelChanged.value = true
  }
}

const copyId = (row: DataPlaneNode, copyToClipboard: (val: string) => boolean): void => {
  const id = row.id as string

  if (!copyToClipboard(id)) {
    toaster.open({
      appearance: 'danger',
      message: t('entities.dp-nodes.error.copy.fail'),
    })

    return
  }

  toaster.open({
    appearance: 'success',
    message: t('entities.dp-nodes.copy.success', { id }),
  })
}

watch(modalVisible, (val) => {
  if (!val && hasLogLevelChanged.value) {
    // if some log level has been changed, re-fetch data planes when modal is closed
    tableKey.value++
  }
})
</script>

<style scoped lang="scss">
.actions-trigger {
  background-color: $kui-color-background-transparent !important;
  border: none !important;
}

.node-log-level-container {
  display: flex;
  gap: $kui-space-40;
  align-items: center;
}
</style>
