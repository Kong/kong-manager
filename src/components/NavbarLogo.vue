<template>
  <div class="brand-logo">
    <router-link
      :to="{ name: 'home' }"
      title="go to homepage"
    >
      <img
        src="@/assets/logo.svg?external"
        alt="Kong Manager Logo"
      >
    </router-link>
  </div>
</template>
