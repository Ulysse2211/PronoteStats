import * as types from "../../types"
import * as pronote from "pawnote";
import {getSession, logserv} from "~~/utils";
import type {SessionHandle} from "pawnote";

export async function getAbs (session: SessionHandle, tab: any): Promise<types.Absence[]> {
  let absAr:types.Absence[] | null = []
  for (const sper of tab.periods) {
    const nb = await pronote.notebook(session, sper);
    for (const abs of nb.absences) {
      const fabs = {
        info: {
          reason: abs.reason,
          days: abs.daysMissed,
          hours: abs.hoursMissed,
          minutes: abs.minutesMissed
        },
        date: {
          start: abs.startDate,
          end: abs.endDate
        },
        id: abs.id,
        status: {
          justified: abs.justified,
          opened: abs.opened,
          need_justification: abs.shouldParentsJustify,
          administratively_fixed: abs.administrativelyFixed
        }
      }
      absAr.push(fabs);
    }
  }
  return absAr;
}

export async function getNotebook (sessiondata: types.UserLogin) {
  let session = await getSession(sessiondata)
  const tab = session.userResource.tabs.get(pronote.TabLocation.Notebook);
  if (!tab) throw new Error();
  const Notebook: types.Notebook = {
    "absences" : await getAbs(session, tab),
  }
  return Notebook;
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
 if (!body.username || !body.password || !body.url) {
    return {
      error: "Missing parameters"
    }
  } else if (typeof(body.username) !== "string" || typeof(body.password) !== "string" || typeof(body.url) !== "string") {
    return {
      error: "Parameters must be strings"
    }
  }
  const {url, password, username} = body
  if (!url.startsWith("http")) {
    return {
      error: "URL must start with http or https"
    }
  }

  const result = await getNotebook({
    url: url,
    password: password,
    username: username
  })

  logserv(`Notebook fetched for ${username}`, 1, "API/notebook")
  return send(event, JSON.stringify(result), 'application/json')
})
