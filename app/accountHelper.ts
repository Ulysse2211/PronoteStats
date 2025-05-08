import * as types from "../types"
import {logclient} from "../utils";
import {selectedAccount, timetable, timetableStats, pronoteAccounts} from './sharedHelper'
import {UpdateValues} from './accountValuesUpdater'

// small helper to get the first account to auto loggin when accounts are saved
export async function selectFirstAccount() {
  if (pronoteAccounts.value.length > 0) {
    const lastAccount: types.UserLogin | undefined = pronoteAccounts.value[pronoteAccounts.value.length - 1]
    if (lastAccount && lastAccount.username && lastAccount.password && lastAccount.url) {
      await SelectAccount(lastAccount)
      logclient(`Auto login with ${lastAccount.username}`, 1, "ACCOUNT/selectFirstAccount")
    }
  }
}

// store account credentials in local storage
export async function SaveAccount(accountPayload: types.UserLogin) {
  const toast = useToast()

  if (!localStorage.getItem('PronoteCredentials')) {
    localStorage.setItem('PronoteCredentials', JSON.stringify([]))
    logclient("No accounts found, creating new storage", 1, "ACCOUNT/SaveAccount")
  }
  const accounts = JSON.parse(localStorage.getItem('PronoteCredentials') || '[]')
  const alreadyExists = accounts.some((acc: any) => acc.username === accountPayload.username && acc.password === accountPayload.password && acc.url === accountPayload.url)
  if (alreadyExists) {
    toast.add({ title: 'Erreur', description: 'Ce compte est déjà enregistré.', icon: 'i-lucide-cross' })
    logclient("Account already exists", 2, "ACCOUNT/SaveAccount", accountPayload)
    return
  }
  accountPayload = await GetInfos(accountPayload)
  accounts.push(accountPayload)
  localStorage.setItem('PronoteCredentials', JSON.stringify(accounts))
  toast.add({ title: 'Succès', description: 'Compte enregistré avec succès.', icon: 'i-lucide-check' })

  pronoteAccounts.value = accounts
  logclient("Account saved", 1, "ACCOUNT/SaveAccount", accountPayload)
}

// select the account and get the corresponding elements
export async function SelectAccount(account: types.UserLogin) {
  const toast = useToast()

  const censored = account.password.substring(0, 3) + '*'.repeat(Math.max(0, account.password.length - 3));
  toast.add({
    title: 'Connexion en cours...',
    description: `Connexion en tant que ${account.username} avec ${censored}.\n\nInstance de pronote: ${account.url}`,
    icon: 'i-lucide-check'
  })

  account = await GetInfos(account)
  if (!account) {
    toast.add({title: 'Erreur', description: 'Impossible de récupérer les informations du compte.', icon: 'i-lucide-cross'})
    logclient("Error fetching account infos", 3, "ACCOUNT/SelectAccount", account)
    return
  }

  toast.add({title: 'Récupération des informations', description: `Cette opération peut prendre du temps en cas de rate limit. Soyez patient`, icon: 'i-lucide-check'})

  if (!(await UpdateValues(account))) {
    toast.add({title: 'Erreur', description: "Erreur lors de la mise a jours des informations", icon: 'i-lucide-x'})
    logclient("Error updating account values", 3, "ACCOUNT/SelectAccount", account)
  } else {
    selectedAccount.value = account
    toast.add({title: 'Connecté', description: `Connecté en tant que ${account.username}`, icon: 'i-lucide-check'})
    logclient(`Selected account ${account.username}`, 1, "ACCOUNT/SelectAccount")
    return true
  }
}

export async function DeleteAccount(account: types.UserLogin) {
  const toast = useToast()

  const accounts = JSON.parse(localStorage.getItem('PronoteCredentials') || '[]')
  for (const acc of accounts) {
    if (acc.username === account.username && acc.password === account.password && acc.url === account.url) {
      accounts.splice(accounts.indexOf(acc), 1)
    }
  }
  localStorage.setItem('PronoteCredentials', JSON.stringify(accounts))
  toast.add({ title: 'Succès', description: 'Compte supprimé avec succès.', icon: 'i-lucide-check' })

  pronoteAccounts.value = accounts

  if (account.username === selectedAccount.value?.username && account.password === selectedAccount.value?.password && account.url === selectedAccount.value?.url) {
    selectedAccount.value = null
    timetable.value = null
    timetableStats.value = null
  }
  logclient(`Deleted account ${account.username}`, 2, "ACCOUNT/DeleteAccount")
}

export function ClearAllAccounts() {
  const toast = useToast()

  localStorage.removeItem('PronoteCredentials')
  pronoteAccounts.value = []
  toast.add({ title: 'Succès', description: 'Tous les comptes ont été supprimés.', icon: 'i-lucide-check' })

  selectedAccount.value = null
  logclient(`Deleted all accounts`, 2, "ACCOUNT/ClearAllAccounts")
}

// function to update the account infos, such as the profile picture to avoid it being blank after a while
export async function UpdateAllInfos() {
  let new_account_list: types.UserLogin[] = []

  for (const account of pronoteAccounts.value) {
    const updatedAccount = await GetInfos(account)
    if (updatedAccount) {
      new_account_list.push(updatedAccount)
      logclient("Updated account infos", 1, "ACCOUNT/UpdateInfos", updatedAccount)
    } else {
      logclient("Error updating account infos", 2, "ACCOUNT/UpdateInfos")
    }
  }
  pronoteAccounts.value = new_account_list
  localStorage.setItem('PronoteCredentials', JSON.stringify(new_account_list))
}

export async function GetInfos(account: types.UserLogin) : Promise<types.UserLogin> {
  logclient("Fetching account infos", 1, "ACCOUNT/GetInfos")
  return await $fetch('/api/accountinfos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      username: account.username,
      password: account.password,
      url: account.url,
    },
  })
}
