import * as pronote from "pawnote";
import * as types from "./types";

// Function to get the pronote session
export async function getSession(sessiondata: types.UserLogin) { // TODO: Move that to an endpoint and refactor for better auth with qrcode and next time tokens to be safer and cleaner
    const session = pronote.createSessionHandle();
    if (sessiondata.password) {
      await pronote.loginCredentials(session, {
        url: sessiondata.url,
        deviceUUID: "PronoteStats",
        kind: pronote.AccountKind.STUDENT,
        username: sessiondata.username,
        password: sessiondata.password,
      });
    } else if (sessiondata.token) {
      await pronote.loginToken(session, {
        url: sessiondata.url,
        kind: pronote.AccountKind.STUDENT,
        username: sessiondata.username,
        token: sessiondata.token,
        deviceUUID: "PronoteStats",
      })
    }

    return session
}

export function logserv(msg: string, gravity: number = 0, section: string | undefined = undefined) {
  if (gravity > 3) {logserv("Gravity must be between 0 and 3", 3, "LOGSERV"); return;}
  const mscolor = gravity === 0 ? '\x1b[37m' : gravity === 1 ? '\x1b[32m' : gravity === 2 ? '\x1b[33m' : '\x1b[31m';
  const prcolor = gravity === 0 ? '\x1b[47m' : gravity === 1 ? '\x1b[42m' : gravity === 2 ? '\x1b[43m' : '\x1b[41m';
  const prefix = `[${new Date().toLocaleString()}] ${mscolor}▶ ${section}\x1b[0m | ${prcolor} ${gravity === 0 ? 'DEBUG' : gravity === 1 ? 'INFO' : gravity === 2 ? 'WARNING' : 'ERROR'} \x1b[0m`;
  const message = `${prefix} ${mscolor} ${msg} \x1b[0m`;
  console.log(message);
}

export function logclient(msg: string, gravity: number = 0, section: string | undefined = undefined, object: any = undefined) {
  if (gravity > 3) {logclient("Gravity must be between 0 and 3", 3, "LOGCLIENT"); return;}
  const prcolor = gravity === 0 ? 'white' : gravity === 1 ? '#00DC82' : gravity === 2 ? '#FFA500' : '#FF2200';
  const mscolor = prcolor + '20';
  const prefix = `[${new Date().toLocaleString()}] ▶ %c${section}｜${gravity === 0 ? 'DEBUG' : gravity === 1 ? 'INFO' : gravity === 2 ? 'WARNING' : 'ERROR'}`;
  const message = `${prefix} %c ${msg}`;
  const styles = [`color: black; border-radius: 3px 0 0 3px; padding: 2px 2px 1px 10px; background: ${prcolor}`, `border-radius: 0 3px 3px 0; padding: 2px 10px 1px 2px; background: ${mscolor}`];

  switch (gravity) {
    case 0:
      console.debug(message, ...styles, object ? object : '');
      break;
    case 1:
      console.info(message, ...styles, object ? object : '');
      break;
    case 2:
      console.warn(message, ...styles, object ? object : '');
      break;
    case 3:
      console.error(message, ...styles, object ? object : '');
      break;
  }
}
