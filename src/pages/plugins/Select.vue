<template>
  <div class="plugins-shell">
    <PageHeader title="New Plugin">
      <div class="plugins-filter-wrapper">
        <input
          v-model="filter"
          class="k-input"
          type="search"
          placeholder="Filter Plugins"
          data-testid="plugins-filter"
        >
      </div>
    </PageHeader>
    <section
      v-if="hasFilteredResults"
      aria-live="polite"
    >
      <template v-for="(group, idx) in pluginGroups">
        <div
          v-if="filteredPlugins[group]"
          :key="idx"
          class="row"
        >
          <div class="col">
            <h5>{{ group }}</h5>
            <div class="row filter-row">
              <component
                :is="plugin.disabledMessage ? 'KTooltip' : plugin.available ? 'router-link' : 'div'"
                v-for="(plugin, index) in filteredPlugins[group]"
                :key="index"
                :title="!plugin.available ? 'This plugin is not available' : plugin.name"
                :label="plugin.disabledMessage"
                :to="{
                  name: createPathName,
                  params: {
                    pluginType: plugin.id,
                  },
                  query: {
                    ...$route.query
                  }
                }"
                :class="!plugin.available || plugin.disabledMessage ? 'disabled' : ''"
                class="plugin-card col-6 col-lg-4 col-xl-3"
              >
                <template #content>
                  <div style="max-width: 345px;">
                    {{ plugin.disabledMessage }}
                  </div>
                </template>
                <template #default>
                  <PluginCard
                    :plugin="plugin"
                  />
                </template>
              </component>
            </div>
          </div>
        </div>
      </template>
    </section>
    <section v-else-if="noSearchResults">
      <div
        class="row"
        data-testid="no-results"
      >
        <div class="col-12">
          <h4>No results found for "{{ filter }}"</h4>
        </div>
      </div>
    </section>
    <div v-else>
      <KSkeleton
        :table-rows="1"
        type="table"
      >
        <KSkeletonBox
          width="6"
        />
        <KSkeletonBox
          class="search-result-skeleton-box-right"
          width="6"
        />
      </KSkeleton>
      <PluginCardSkeleton
        :card-count="8"
        type="card"
      />
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { PluginGroup, PluginScope } from '@kong-ui-public/entities-plugins'
import { sortAlpha } from '@/components/EntityForm/helpers'
import { useInfoStore } from '@/stores/info'
import PluginCardSkeleton from './PluginCardSkeleton.vue'
import PluginCard from './PluginCard.vue'
import { pluginMeta } from './PluginMeta'

export default {
  name: 'PluginSelect',
  components: { PluginCard, PluginCardSkeleton },

  props: {
    createPathName: {
      type: String,
      default: 'plugin-create',
    },
    disabledPlugins: {
      type: Object,
      default: () => ({}),
    },
    /**
     * @param {boolean} showOnlyAvailablePlugins checks kong config plugins.available_on_server and if
     * showOnlyAvailablePlugins = true, then it will not show plugins from PluginMeta that are outside
     * of the available_on_server array.
     */
    showOnlyAvailablePlugins: {
      type: Boolean,
      default: true,
    },
  },

  data () {
    return {
      pluginsList: {},
      pluginGroups: PluginGroup,
      selected: null,
      filter: '',
    }
  },

  computed: {
    ...mapState(useInfoStore, ['info']),

    filteredPlugins () {
      const plugins = this.pluginsList
      const query = this.filter.toLowerCase()

      return Object.keys(plugins).reduce((acc, cur) => {
        const matches = plugins[cur].filter(plugin => {
          return plugin.name.toLowerCase().includes(query) ||
                 plugin.group.toLowerCase().includes(query)
        })

        if (matches.length) {
          acc[cur] = matches
        }

        return acc
      }, {})
    },

    hasFilteredResults () {
      return Object.keys(this.filteredPlugins).length > 0
    },

    noSearchResults () {
      return (Object.keys(this.pluginsList).length > 0 && !this.hasFilteredResults)
    },

    availablePlugins () {
      return this.info?.plugins?.available_on_server ?? []
    },
  },

  watch: {
    availablePlugins: {
      handler () {
        this.pluginsList = this.buildPluginList()
      },
      immediate: true,
    },
  },

  methods: {
    buildPluginList () {
      // If showOnlyAvailablePlugins is false,
      // we included unavailable plugins from pluginMeta
      // in addition to available plugins
      return [...new Set(Object.keys({
        ...(!this.showOnlyAvailablePlugins && pluginMeta),
        ...this.availablePlugins,
      }))]
        // Filter to just consumer plugins if adding plugin to a consumer
        .filter(plugin => {
          const entityType = this.$route.query.entity_type
          if (!entityType) {
            return plugin
          }

          if (entityType === 'service_id') {
            const isNotServicePlugin = (pluginMeta[plugin] && !pluginMeta[plugin].scope.includes(PluginScope.SERVICE))
            if (isNotServicePlugin) {
              return false
            }
          }

          if (entityType === 'route_id') {
            const isNotRoutePlugin = (pluginMeta[plugin] && !pluginMeta[plugin].scope.includes(PluginScope.ROUTE))
            if (isNotRoutePlugin) {
              return false
            }
          }

          const isConsumerPlugin = pluginMeta[plugin]?.scope.includes(PluginScope.CONSUMER) ?? true
          if (isConsumerPlugin || !['consumer_id', 'developer_id'].includes(entityType)) {
            return plugin
          }

          return false
        })
        .reduce((list, id) => {
          const pluginName = (pluginMeta[id] && pluginMeta[id].name) || id
          const plugin = {
            id,
            name: pluginName,
            available: this.availablePlugins[id] !== undefined,
            disabledMessage: this.disabledPlugins[id],
            group: (pluginMeta[id] && pluginMeta[id].group) || PluginGroup.CUSTOM_PLUGINS,
            ...pluginMeta[id],
          }

          if (!list[plugin.group]) {
            list[plugin.group || 'Other Plugins'] = []
          }

          list[plugin.group || 'Other Plugins'].push(plugin)

          list[plugin.group].sort(sortAlpha('name'))

          return list
        }, {})
    },
  },
}
</script>

<style lang="scss" scoped>
.page-header {
  border-bottom: 1px solid $kui-color-border;
  margin-bottom: 2rem;
}

.plugins-shell {
  :deep(.kong-card) {
    padding: 0;
    margin: 0;
    text-align: center;
    display: flex;
    flex-direction: column;
    flex: 1 0 0%;
  }

  :deep(.k-card-body) {
    flex-direction: column;
    display: flex;
    flex: 1;
  }

  .plugins-filter-wrapper {
    display: flex;
    flex-direction: column;
  }

  .filter-row {
    margin-top: $kui-space-60;
  }

  .search-result-skeleton-box-right {
    margin-left: $kui-space-60;
  }
}
</style>
