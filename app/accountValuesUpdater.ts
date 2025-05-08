import * as types from "../types"
import {getTimetableStats, getNotebookStats} from "~/statsHelper";
import {FetchB,
  timetable, timetableStats,
  notebook, notebookStats
} from './sharedHelper'


export async function UpdateValues(account: types.UserLogin) {
  try {
    timetable.value = await FetchB('timetable', account) as types.Timetable
    timetableStats.value = getTimetableStats(timetable.value)

    notebook.value = await FetchB('notebook', account) as types.Notebook
    notebookStats.value = getNotebookStats(notebook.value, timetable.value)

    return true
  } catch (error) {
    console.error('Error selecting account:', error)
    return false
  }
}
