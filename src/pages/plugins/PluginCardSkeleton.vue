<template>
  <KSkeleton
    :card-count="cardCount"
    class="k-skeleton-25"
    type="card"
  >
    <template #card-header>
      <div class="skeleton-card-header">
        <KSkeletonBox width="25" />
      </div>
    </template>
    <template #card-content>
      &nbsp;
    </template>
    <template #card-footer>
      <div class="skeleton-card-footer">
        <hr style="margin: 0 -1rem 1rem;">
        <div class="skeleton-card-footer-skeleton">
          <KSkeletonBox width="25" />
        </div>
      </div>
    </template>
  </KSkeleton>
</template>

<script>
export default {
  name: 'PluginCardSkeleton',
  props: {
    cardCount: {
      type: Number,
      default: 1,
      required: false,
    },
  },
}
</script>

<style lang="scss">
.k-skeleton-25 {
  .skeleton-card {
    height: 240px;
  }

  .skeleton-card-column {
    margin-bottom: 16px;
    margin-bottom: $kui-space-60;
    width: calc(33% - 16px);
    width: 24%;
  }
}

.skeleton-card-header {
  margin-left: auto;
  margin-right: auto;
}

.skeleton-card-footer {
  width: 100%;
  .skeleton-card-footer-skeleton {
    display: flex;
    justify-content: center;
    padding-bottom: $kui-space-40;
    padding-top: $kui-space-40;
  }
}
</style>
