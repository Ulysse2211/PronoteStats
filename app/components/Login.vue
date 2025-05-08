<script setup lang="ts">
import {SaveAccount, SelectAccount} from "~/accountHelper";
import * as z from "zod";
import type {FormSubmitEvent} from "@nuxt/ui";
import * as types from "~~/types";
import {logclient} from "~~/utils";

const schema = z.object({
  username: z.string(),
  password: z.string(),
  url: z.string().url(),
  remember: z.boolean(),
})
type Schema = z.output<typeof schema>

// function to validate the form
async function AddAccount(payload: FormSubmitEvent<Schema>) {
  const accountPayload: types.UserLogin =  {
    username: payload.data.username,
    password: payload.data.password,
    url: payload.data.url,
  }
  let succes = await SelectAccount(accountPayload)
  if (payload.data.remember && succes) {
    await SaveAccount(accountPayload)
  }
}
// The fields for the login form
const fields = ref([{
    name: 'username',
    type: 'text',
    label: "Nom d'utilisateur",
    placeholder: 'Entrez votre nom d\'utilisateur'
  },{
    name: 'password',
    type: 'password',
    label: 'Mot de passe',
    placeholder: 'Entrez votre mot de passe'
  },{
    name: 'url',
    type: 'text',
    label: 'URL de Pronote',
    placeholder: 'https://demo.index-education.net/pronote/'
  },{
    name: 'remember',
    label: 'Se rappeler de moi',
    type: 'checkbox' as const
  }]
)

logclient("Login form loaded", 1, "COMPONENT/Login")
</script>

<template>
  <UCard variant="subtle" class="m-5 md:m-10 lg:m-20 h-fit w-fit">
    <div class="flex justify-center gap-20">
      <Logo :big="true"/>
      <UAuthForm
        class="max-w-md m-10"
        title="Ajouter un compte Pronote"
        description="Entrez vos informations afin d'obtenir vos statistiques."
        icon="i-lucide-user"
        :fields="fields"
        @submit="AddAccount"
      />
    </div>
  </UCard>
</template>

<style scoped>

</style>
