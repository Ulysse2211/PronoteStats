import * as types from "../../../types"
import {logserv} from "~~/utils";
import * as pronote from "pawnote";

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  if (!body.username || (!body.password || (!body.qrcode || !body.qrcodepin)) || !body.url) {
    return {
      error: "Missing parameters"
    }
  }
  const url = body.url
  const username = body.username
  const password = body.password
  const qrcode = body.qrcodr
  const qrcodepin = body.qrcodepin

  if (!url.startsWith("http")) {
    return {
      error: "URL must start with http or https"
    }
  }

  let refresh
  const session = pronote.createSessionHandle();
  if (password) {
    refresh = await pronote.loginCredentials(session, {
      url: url,
      deviceUUID: "PronoteStats",
      kind: pronote.AccountKind.STUDENT,
      username: username,
      password: password,
    });
  } else if (qrcode && qrcodepin) {
    refresh = await pronote.loginQrCode(session, {
      deviceUUID: "PronoteStats",
      pin: qrcodepin,
      qr: qrcodepin
    });
  } else { throw new Error("Invalid login credentials"); }

  let token = refresh.token

  let account: types.UserLogin = {
    username: username,
    url: url,
    token: token,
  }

  logserv(`Fetched next time token for ${username}`, 1, "API/session/token")
  return send(event, JSON.stringify(account), 'application/json')
})
