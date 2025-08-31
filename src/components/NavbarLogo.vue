<template>
  <div class="brand-logo">
    <router-link
      :to="{ name: 'overview' }"
      title="go to overview page"
    >
      <img
        height="45"
        src="@/assets/logo_white_reverse.png?external"
        alt="apiRuler Manager Logo"
      >
    </router-link>
  </div>
</template>