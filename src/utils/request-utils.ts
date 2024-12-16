import { isArray } from "./type-utils";
const localDomains = ["localhost", "127.0.0.1"];

export const getQueryParam = function (url: string, param: string): string {
  const queryParams: string = url.split("?")[1] || "";
  const queryParts = queryParams.split("&");
  let keyValuePair;

  for (let i = 0; i < queryParts.length; i++) {
    const parts = queryParts[i].split("=");
    if (parts[0] === param) {
      keyValuePair = parts;
      break;
    }
  }

  if (!isArray(keyValuePair) || keyValuePair.length < 2) {
    return "";
  } else {
    let result = keyValuePair[1];
    try {
      result = decodeURIComponent(result);
    } catch (err) {
      //console.log('Skipping decoding for malformed query param: ' + result);
    }
    return result.replace(/\+/g, " ");
  }
};

export const isLocalhost = (): boolean => {
  return localDomains.includes(location.hostname);
};
