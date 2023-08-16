<template>
  <KCard
    :data-testid="plugin.name"
    :disabled="!plugin.available || plugin.disabledMessage"
    border-variant="noBorder"
    has-hover
  >
    <template #body>
      <div class="card-content">
        <h4 class="card-title">
          {{ plugin.name }}
        </h4>
        <PluginIcon
          :name="plugin.id"
          :alt="plugin.name"
          class="card-icon"
          :size="55"
        />
        <p
          v-if="plugin.description"
          class="card-text"
        >
          {{ plugin.description }}
        </p>
      </div>
      <div class="card-footer">
        Enable
      </div>
    </template>
  </KCard>
</template>

<script>
import { PluginIcon } from '@kong-ui-public/entities-plugins'

export default {
  components: { PluginIcon },
  props: {
    /**
     * @param {pluginMeta}
     * src/pages/Plugins/PluginMeta.js
     */
    plugin: {
      type: Object,
      required: true,
    },
  },
}
</script>

<style lang="scss">
.plugin-card {
  display: flex;
  flex-flow: row-wrap;
  color: initial;
  &:hover {
    text-decoration: none;
  }
  margin-bottom: $kui-space-90;
  .card-content {
    background-color: $kui-color-background;
    flex: 1;
    padding: $kui-space-60;
    border-color: $kui-color-border;
    border-style: solid;
    border-width: 1px 1px 0 1px;
  }
  .card-title {
    font-weight: bold;
    font-size: $kui-font-size-40;
    margin-bottom: $kui-space-90;
  }
  .card-icon {
    margin-bottom: $kui-space-60;
  }
  .card-text {
    color: $kui-color-background-neutral-stronger;
    font-weight: 400;
    font-size: $kui-font-size-30;
  }
  .card-footer {
    color: $kui-color-background-primary-strong;
    padding: $kui-space-50;
    font-weight: bold;
    font-size: $kui-font-size-30;
    border: 1px solid $kui-color-background-primary-weak;
    background-color: $kui-color-background-primary-weakest
  }
  .k-card-content {
    flex: 1;
  }
}

.plugin-card.disabled * {
  cursor: not-allowed;
  filter: grayscale(100%);
  opacity: 0.9;
}
</style>
