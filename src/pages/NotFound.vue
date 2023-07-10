<template>
  <section class="not-found">
    <h2>404</h2>
    <i18n-t
      tag="p"
      keypath="not-found.description"
    >
      <template #home>
        <router-link :to="{ name: 'home' }">
          return home
        </router-link>
      </template>
    </i18n-t>
  </section>
</template>

<style lang="scss" scoped>
.not-found {
  height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;

  h2 {
    font-size: 72px;
    color: var(--black-45, rgba(0, 0, 0, .45));
  }

  p {
    max-width: 400px;
  }
}
</style>
