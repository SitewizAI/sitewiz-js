import { uuidv4 } from "./uuid";

export function getSessionId() : [string, boolean]  {
    const name = "sitewizsession=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        const sessionId = c.substring(name.length, c.length);
        return [sessionId, true];
      }
    }
    const newSessionId = uuidv4();
    setCookie("sitewizsession", newSessionId, 1);
    return [newSessionId, false];
  }

export function setCookie(name: string, value: string, days: number) {
    const d = new Date();
    d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = `${name}=${value};${expires};path=/`;
  }