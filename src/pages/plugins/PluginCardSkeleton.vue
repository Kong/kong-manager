<template>
  <KSkeleton
    :card-count="cardCount"
    class="k-skeleton-25"
    type="card"
  >
    <template #card-header>
      <div class="mx-auto">
        <KSkeletonBox width="25" />
      </div>
    </template>
    <template #card-content>
      &nbsp;
    </template>
    <template #card-footer>
      <div class="w-100">
        <hr style="margin: 0 -1rem 1rem;">
        <div class="d-flex justify-content-center py-2">
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
  --KSkeletonCardWidth: 24%;
  .skeleton-card {
    height: 240px;
  }
}
</style>
