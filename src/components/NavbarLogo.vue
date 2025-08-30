<template>
  <div class="brand-logo">
    <router-link
      :to="{ name: 'overview' }"
      title="go to overview page"
    >
      <img
        src="@/assets/logo.png?external"
        alt="apiRuler Manager Logo"
      >
    </router-link>
  </div>
</template>
