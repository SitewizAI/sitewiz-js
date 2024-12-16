// @ts-ignore
import { eventWithTime } from 'rrweb';


const addToCartRegex = /add[\W_]*cart/i;


function getClientId(): string {
  const name = "_ga=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const ca = decodedCookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    const c = ca[i].trim();
    if (c.indexOf(name) == 0) {
      const gaValue = c.substring(name.length);
      const parts = gaValue.split(".");
      if (parts.length == 4) {
        return parts[2] + "." + parts[3]; // Extract the client ID part
      }
    }
  }
  return "";
}

function pollForClientId(cb: (event: eventWithTime) => void) {
  const intervalId = setInterval(() => {
    const clientId = getClientId();
    if (clientId) {
      const clientIdEvent = {
        clientId: clientId,
        timestamp: Date.now(),
      };
      cb(clientIdEvent as unknown as eventWithTime);
      
      // Stop polling after sending the event once
      clearInterval(intervalId);
    }
  }, 2000);
}

export const ga4Plugin = {

  name: 'sitewiz/ga4@1',
  observer: (cb: (event: eventWithTime) => void) => {
    pollForClientId(cb);

    // Return a cleanup function (if needed)
    return () => {
      // Cleanup code if necessary
    };
  },
  options: {},
  reset: () => {},
}
