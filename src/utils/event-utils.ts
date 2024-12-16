import { getQueryParam } from "./request-utils"
import { isFunction } from "./type-utils";
import { osMatchers, detectBrowser, detectDevice, detectDeviceType } from "./ua-utils";

export const CAMPAIGN_PARAMS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid', // google ads
    'gad_source', // google ads
    'gclsrc', // google ads 360
    'dclid', // google display ads
    'gbraid', // google ads, web to app
    'wbraid', // google ads, app to web
    'fbclid', // facebook
    'msclkid', // microsoft
    'twclid', // twitter
    'li_fat_id', // linkedin
    'mc_cid', // mailchimp campaign id
    'igshid', // instagram
    'ttclid', // tiktok
    'rdt_cid', // reddit
]
     


function campaignParamsFuction() {
    if (!document){
        return {};
    }

    const url = document.URL;
    const params: Record<string, any> = {}
    CAMPAIGN_PARAMS.forEach((kwkey) => {
        const kw = getQueryParam(url, kwkey);
        if (kw){
            params[kwkey] = kw;
        }
    })

    return params;
}



const detectOSFunction = function (user_agent: string): [string, string] {
    for (let i = 0; i < osMatchers.length; i++) {
        const [rgex, resultOrFn] = osMatchers[i]
        const match = rgex.exec(user_agent)
        const result = match && (isFunction(resultOrFn) ? resultOrFn(match, user_agent) : resultOrFn)
        if (result) {
            return result
        }
    }
    return ['', '']
}

const detectBrowserLanguageFunction = function () {
    return (
        navigator.language || // Any modern browser
        (navigator as Record<string, any>).userLanguage // IE11
    )
}


async function detectIPFunction() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip;
    } catch (error) {
        return "0.0.0.0";
    }
}



export const Info = {
    campaignParams : campaignParamsFuction,
    detectOS: detectOSFunction,
    detectBrowser: detectBrowser,
    detectBrowserLanguage: detectBrowserLanguageFunction,
    detectDevice: detectDevice,
    detectDeviceType: detectDeviceType,
    detectIP: detectIPFunction
}