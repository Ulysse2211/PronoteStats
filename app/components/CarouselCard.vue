<script setup lang="ts">
const { item } = defineProps(['item'])
</script>

<template>
  <UCard variant="soft" v-if="item">
    <template #header>
      <div v-if="item.icon" class="flex justify-center items-center gap-2">
        <UIcon :name="item.icon" class="size-5 mr-2" />
        <div>
          <h2 class="text-lg md:text-xl font-semibold">{{ item.title }}</h2>
          <p v-if="item.description" class="text-sm text-neutral-500">{{ item.description }}</p>
        </div>
      </div>
      <div v-else>
        <h2 class="text-lg md:text-xl font-semibold">{{ item.title }}</h2>
        <p v-if="item.description" class="text-sm text-neutral-500">{{ item.description }}</p>
      </div>
    </template>

    <div class="grid gap-2">
      <div v-for="field in item.fields">
        <USeparator class="mb-2" v-if="field.separator && (field.separatoricon || field.separatortext)">
          <UIcon v-if="field.separatoricon" :name="field.separatoricon" class="size-3 md:size-5 mr-2 ml-2" />
          <span v-if="field.separatortext" class="text-xs md:text-lg">{{ field.separatortext }}</span>
        </USeparator>
        <USeparator class="mb-2" v-else-if="field.separator && !(field.separatoricon || field.separatortext)"/>
        <div class="flex fit-content">
          <h3 :style="field.color ? 'color: var(--color-' + field.color + ');' : ''" class="text-md md:text-lg font-semibold">{{ field.value }}&nbsp;</h3>
          <span v-if="field.valuedesc" class="text-md 2xl:text-lg place-self-end text-neutral-500">{{ field.valuedesc }}</span>
        </div>
      </div>
    </div>
  </UCard>
</template>

<style scoped>

</style>
