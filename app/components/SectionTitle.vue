<script setup lang="ts">
const { label, color } = defineProps(['label', 'color'])
</script>

<template>
  <div class="w-fit">
    <h1 :class="`text-xl md:text-2xl text-${color? color : 'neutral'} font-semibold mb-3 md:mb-1`">{{ label }}</h1>
    <hr class="w-[95%] mb-5 hidden md:block">
  </div>
</template>
