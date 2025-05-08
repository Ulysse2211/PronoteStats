<script setup>
import { Analytics } from '@vercel/analytics/nuxt'
import { modalDeleteAllOpen } from '~/sharedHelper'
import { ClearAllAccounts } from "~/accountHelper";
import { logclient } from "../utils";

logclient("Sample debug message", 0, "APP");
logclient("Sample info message", 1, "APP");
logclient("Sample warning message", 2, "APP");
logclient("Sample error message", 3, "APP");

useHead({
  meta: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' }
  ],
  link: [
    { rel: 'icon', href: '/logo.svg' }
  ],
  htmlAttrs: {
    lang: 'fr'
  }
})

const title = 'Pronote Stats'
const description = 'Une application web pour visualiser vos statistiques Pronote.'
const icon = '/logo.svg'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogImage: icon,
})
</script>

<template>
  <Analytics/>
  <UModal class="absolute z-400" v-model:open="modalDeleteAllOpen">
    <template #content>
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Êtes-vous sûr de vouloir supprimer tous les comptes ?</h2>
          <p class="text-sm text-(--ui-text-muted)">Cette action est irréversible.</p>
        </template>
        <div class="flex gap-5 justify-end items-center">
          <UButton variant="outline" color="secondary" @click="() => {modalDeleteAllOpen = false}">
            Annuler
          </UButton>
          <UButton icon="i-lucide-trash-2" variant="subtle" color="error" @click="() => {modalDeleteAllOpen = false
        ClearAllAccounts()}">
            Supprimer
          </UButton>
        </div>
      </UCard>
    </template>
  </UModal>
  <UApp>
    <AccountSelector class="left-O z-100 fixed m-1.5"/>

    <UHeader>
      <template #left>
        <span></span>
      </template>

      <template #right>
        <UColorModeButton />
      </template>

      <Logo class="w-auto h-6 shrink-0" />
    </UHeader>

    <UMain>
      <NuxtPage/>
    </UMain>

    <USeparator>
      <UIcon name="i-lucide-chart-no-axes-combined" class="size-5 mr-2" />
      <span>Pronote Stats</span>
    </USeparator>

    <UFooter>
      <template #left>
        <p class="text-sm text-(--ui-text-muted)">
          Copyright © {{ new Date().getFullYear() }}
        </p>
      </template>

      <template #right>
        <span>Fait avec 💗 par Ulysse avec NuxtJS et Pawnote </span>
      </template>
    </UFooter>
  </UApp>
</template>
