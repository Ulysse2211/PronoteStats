import * as types from "../../types"
import {getSession, logserv} from "~~/utils";

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

  let account: types.UserLogin = {
    username: username,
    password: password,
    url: url,
  }

  const session = await getSession(account as types.UserLogin)
  account.infos = {
    name: session.user.name,
    school: session.userResource.establishmentName,
    profilepic: session.userResource.profilePicture? session.userResource.profilePicture.url : 'https://www.index-education.com/contenu/img/fr/logo-application-mobile-pronote.svg',
  }

  logserv(`Account infos fetched for ${username}`, 1, "API/accountinfos")
  return send(event, JSON.stringify(account), 'application/json')
})
