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
          :name="plugin.imageName || plugin.id"
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
import { PluginIcon } from '@kong-ui/entities-plugins'

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
  margin-bottom: var(--spacing-xl);
  .card-content {
    background-color: var(--white);
    flex: 1;
    padding: var(--spacing-md);
    border-color: var(--black-10);
    border-style: solid;
    border-width: 1px 1px 0 1px;
  }
  .card-title {
    font-weight: bold;
    font-size: var(--type-md);
    margin-bottom: var(--spacing-xl);
  }
  .card-icon {
    margin-bottom: var(--spacing-md);
  }
  .card-text {
    color: var(--black-70);
    font-weight: 400;
    font-size: var(--type-sm);
  }
  .card-footer {
    color: var(--blue-500);
    padding: var(--spacing-sm);
    font-weight: bold;
    font-size: var(--type-sm);
    border: 1px solid var(--blue-300);
    background-color: var(--blue-100);
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
