import * as types from "~~/types";

// Some shared variables between components and scripts

// Reactive main values
export let timetable: Ref<types.Timetable | null> = ref(null)
export let timetableStats = ref<types.TimetableStats | null>(null)

export let notebook: Ref<types.Notebook | null> = ref(null)
export let notebookStats = ref<types.NotebookStats | null>(null)

// Reactive account values

export let pronoteAccounts: Ref<types.UserLogin[]> = ref(localStorage.getItem('PronoteCredentials')? JSON.parse(localStorage.getItem('PronoteCredentials')!): [])
export let selectedAccount: Ref<types.UserLogin | null> = ref(null)

export const modalDeleteAllOpen = ref(false)

// fetch from backend
export function FetchB(path: string,
                       login: types.UserLogin | undefined = undefined,
                       body: any | undefined = undefined): Promise<any> {
  let fbody = {}
  if (login) {
    fbody = {
      username: login.username,
      password: login.password,
      url: login.url,
      ...body,
    }
  }
  if (body) {
    fbody = {
      ...fbody,
      ...body,
    }
  }
  const r = $fetch(`/api/${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: fbody,
  })
  if (!r) {
    throw new Error('FetchB no response')
  }
  if ("error" in r) {
    throw new Error('FetchB error: ' + r.error)
  }
  return r
}
