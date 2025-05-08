<script setup lang="ts">
import { pronoteAccounts, selectedAccount, modalDeleteAllOpen } from '~/sharedHelper'
import { DeleteAccount, SelectAccount, UpdateAllInfos} from '~/accountHelper'

const items = ref([])

const updateDropdownItems = async () => {
  const accountDelItems = pronoteAccounts.value.map(account => [{
    label: account.infos?.name || 'Utilisateur',
    avatar: {src: account.infos?.profilepic},
    type: 'item' as const,
    color: 'error',
    onClick: () => {
      DeleteAccount(account)
    },
  }])

  const baseItems = [[
    {
      label: 'Mes comptes',
      type: 'header' as const,
    },
    {
      label: 'Ajouter un compte',
      icon: 'i-lucide-plus',
      type: 'item' as const,
      onClick: () => {
        selectedAccount.value = null
      },
    },
    {
      label: 'Supprimer un compte',
      icon: 'i-lucide-trash-2',
      children: [
        ...accountDelItems,
        [
          {
            label: 'Supprimer tous les comptes',
            icon: 'i-lucide-trash-2',
            type: 'item' as const,
            color: 'error',
            onClick: () => {
              modalDeleteAllOpen.value = true
            },
          }
        ]
      ]
    },
  ]]

  const accountItems = pronoteAccounts.value.map(account => [{
    label: account.infos?.name || 'Utilisateur',
    avatar: {src: account.infos?.profilepic},
    type: 'item' as const,
    onClick: () => {
      SelectAccount(account)
    },
  }])

  // @ts-ignore
  items.value = [...baseItems, ...accountItems]
}

updateDropdownItems()
await UpdateAllInfos()

watch(pronoteAccounts, updateDropdownItems, { deep: true })
watch(selectedAccount, updateDropdownItems, { deep: true })
</script>


<template>
  <UDropdownMenu v-if="pronoteAccounts.length > 0" :items="items" :content="{ align: 'start' }" :ui="{ content: 'w-48' }">
    <UButton v-if="selectedAccount" color="neutral" variant="subtle">
      <UUser v-if="selectedAccount"
             target="_blank"
             :name="selectedAccount?.infos?.name"
             :description="selectedAccount?.infos?.school"
             :avatar="{
          src: selectedAccount?.infos?.profilepic,
        }"
      />
    </UButton>
    <UButton v-else-if="!selectedAccount" icon="i-lucide-user" color="neutral" variant="subtle" label="Sélectionnez un compte"/>
  </UDropdownMenu>
</template>
