import { eventWithTime } from "rrweb";
import { Info } from "../utils/event-utils";



export const UAPlugin = {
    name: 'sitewiz/ua@1',
    observer: async (cb: (event: eventWithTime) => void) => {
        if(navigator?.userAgent){
            const userAgent = navigator.userAgent;
            const payload = {
                browser: Info.detectBrowser(userAgent, navigator.vendor),
                browserLanguage: Info.detectBrowserLanguage(),
                os: Info.detectOS(userAgent),
                device: Info.detectDevice(userAgent),
                deviceType: Info.detectDeviceType(userAgent),
                ip: await Info.detectIP()
            }

            cb(payload as unknown as eventWithTime);
        }
        
        return () => {

        };    
    },
    option: {},
    reset: () => {},
}