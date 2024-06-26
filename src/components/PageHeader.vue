<template>
  <header class="page-header">
    <div class="row">
      <component :is="tag">
        <span
          v-if="!hideTitle"
          class="title"
        >{{ title }}</span>
        <slot name="title-logo" />
      </component>
      <nav
        class="header-actions"
        data-testid="header-actions"
      >
        <slot />
      </nav>
    </div>
    <slot name="below-title" />
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({
  name: 'PageHeader',
})

const props = defineProps({
  title: {
    type: String,
    default: '',
  },
  size: {
    type: Number,
    default: 3,
  },
  hideTitle: {
    type: Boolean,
    default: false,
  },
})

const tag = computed(() => `h${props.size}`)
</script>

<style lang="scss" scoped>
.page-header h1, h2, h3, h4, h5, h6 {
  font-weight: $kui-font-weight-bold;
  font-size: $kui-font-size-70;
  color: $kui-color-text;
  .title {
    word-break: break-all;
  }
}

.row {
  justify-content: space-between;
  padding: 0 15px;
}

h1, h2, h3, h4, h5, h6, nav {
  margin-top: 0px;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.header-actions {
  -ms-flex-positive: 0.1 !important;
  flex-grow: 0;
  white-space: nowrap;
  display: inline-flex;
  justify-content: flex-end;
  margin-left: auto;
}
</style>
