<script setup lang="ts">
const { big } = defineProps(['big'])
</script>

<template>
  <div v-if="!big" class="flex items-center gap-2">
    <NuxtLink to="/">
      <img src="assets/images/logo.svg" class="w-auto h-15 shrink-0" alt="logo"/>
    </NuxtLink>
    <h1 class="text-lg font-bold text-error-500 hidden md:block">Pronote Stats</h1>
  </div>
  <div v-else class="flex items-center gap-2 hidden lg:block">
    <img src="assets/images/logo.svg" class="w-auto h-[70%] shrink-0" alt="logo"/>
    <h1 class="text-2xl font-bold text-error-500">Une application web pour visualiser vos statistiques Pronote.</h1>
  </div>
</template>
