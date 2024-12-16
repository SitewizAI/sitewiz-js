import { isNull, isUndefined } from "./type-utils"

const FACEBOOK = 'Facebook'
const MOBILE = 'Mobile'
const IOS = 'iOS'
const ANDROID = 'Android'
const TABLET = 'Tablet'
const ANDROID_TABLET = ANDROID + ' ' + TABLET
const IPAD = 'iPad'
const APPLE = 'Apple'
const APPLE_WATCH = APPLE + ' Watch'
const SAFARI = 'Safari'
const BLACKBERRY = 'BlackBerry'
const SAMSUNG = 'Samsung'
const SAMSUNG_BROWSER = SAMSUNG + 'Browser'
const SAMSUNG_INTERNET = SAMSUNG + ' Internet'
const CHROME = 'Chrome'
const CHROME_OS = CHROME + ' OS'
const CHROME_IOS = CHROME + ' ' + IOS
const INTERNET_EXPLORER = 'Internet Explorer'
const INTERNET_EXPLORER_MOBILE = INTERNET_EXPLORER + ' ' + MOBILE
const OPERA = 'Opera'
const OPERA_MINI = OPERA + ' Mini'
const EDGE = 'Edge'
const MICROSOFT_EDGE = 'Microsoft ' + EDGE
const FIREFOX = 'Firefox'
const FIREFOX_IOS = FIREFOX + ' ' + IOS
const NINTENDO = 'Nintendo'
const PLAYSTATION = 'PlayStation'
const XBOX = 'Xbox'
const ANDROID_MOBILE = ANDROID + ' ' + MOBILE
const MOBILE_SAFARI = MOBILE + ' ' + SAFARI
const WINDOWS = 'Windows'
const WINDOWS_PHONE = WINDOWS + ' Phone'
const NOKIA = 'Nokia'
const OUYA = 'Ouya'
const GENERIC = 'Generic'
const GENERIC_MOBILE = GENERIC + ' ' + MOBILE.toLowerCase()
const GENERIC_TABLET = GENERIC + ' ' + TABLET.toLowerCase()
const KONQUEROR = 'Konqueror'

const BROWSER_VERSION_REGEX_SUFFIX = '(\\d+(\\.\\d+)?)'
const DEFAULT_BROWSER_VERSION_REGEX = new RegExp('Version/' + BROWSER_VERSION_REGEX_SUFFIX)

const XBOX_REGEX = new RegExp(XBOX, 'i')
const PLAYSTATION_REGEX = new RegExp(PLAYSTATION + ' \\w+', 'i')
const NINTENDO_REGEX = new RegExp(NINTENDO + ' \\w+', 'i')
const BLACKBERRY_REGEX = new RegExp(BLACKBERRY + '|PlayBook|BB10', 'i')

export const osMatchers: [
    RegExp,
    [string, string] | ((match: RegExpMatchArray | null, user_agent: string) => [string, string])
][] = [
    [
        new RegExp(XBOX + '; ' + XBOX + ' (.*?)[);]', 'i'),
        (match) => {
            return [XBOX, (match && match[1]) || '']
        },
    ],
    [new RegExp(NINTENDO, 'i'), [NINTENDO, '']],
    [new RegExp(PLAYSTATION, 'i'), [PLAYSTATION, '']],
    [BLACKBERRY_REGEX, [BLACKBERRY, '']],
    [
        new RegExp(WINDOWS, 'i'),
        (_, user_agent) => {
            if (/Phone/.test(user_agent) || /WPDesktop/.test(user_agent)) {
                return [WINDOWS_PHONE, '']
            }
            // not all JS versions support negative lookbehind, so we need two checks here
            if (new RegExp(MOBILE).test(user_agent) && !/IEMobile\b/.test(user_agent)) {
                return [WINDOWS + ' ' + MOBILE, '']
            }
            const match = /Windows NT ([0-9.]+)/i.exec(user_agent)
            if (match && match[1]) {
                const version = match[1]
                // let osVersion = windowsVersionMap[version] || ''
                // if (/arm/i.test(user_agent)) {
                    // osVersion = 'RT'
                // }
                // return [WINDOWS, osVersion]
            }
            return [WINDOWS, '']
        },
    ],
    [
        /((iPhone|iPad|iPod).*?OS (\d+)_(\d+)_?(\d+)?|iPhone)/,
        (match) => {
            if (match && match[3]) {
                const versionParts = [match[3], match[4], match[5] || '0']
                return [IOS, versionParts.join('.')]
            }
            return [IOS, '']
        },
    ],
    [
        /(watch.*\/(\d+\.\d+\.\d+)|watch os,(\d+\.\d+),)/i,
        (match) => {
            // e.g. Watch4,3/5.3.8 (16U680)
            let version = ''
            if (match && match.length >= 3) {
                version = isUndefined(match[2]) ? match[3] : match[2]
            }
            return ['watchOS', version]
        },
    ],
    [
        new RegExp('(' + ANDROID + ' (\\d+)\\.(\\d+)\\.?(\\d+)?|' + ANDROID + ')', 'i'),
        (match) => {
            if (match && match[2]) {
                const versionParts = [match[2], match[3], match[4] || '0']
                return [ANDROID, versionParts.join('.')]
            }
            return [ANDROID, '']
        },
    ],
    [
        /Mac OS X (\d+)[_.](\d+)[_.]?(\d+)?/i,
        (match) => {
            const result: [string, string] = ['Mac OS X', '']
            if (match && match[1]) {
                const versionParts = [match[1], match[2], match[3] || '0']
                result[1] = versionParts.join('.')
            }
            return result
        },
    ],
    [
        /Mac/i,
        // mop up a few non-standard UAs that should match mac
        ['Mac OS X', ''],
    ],
    [/CrOS/, [CHROME_OS, '']],
    [/Linux|debian/i, ['Linux', '']],
]



const includes = function (
    obj: string,
    target: string    
) : boolean {
    if (isNull(obj)){
        return false;
    }

    return obj.indexOf(target) != -1;
}

function isSafari(userAgent: string): boolean {
    return includes(userAgent, SAFARI) && !includes(userAgent, CHROME) && !includes(userAgent, ANDROID)
}

const safariCheck = (ua: string, vendor?: string) => (vendor && includes(vendor, APPLE)) || isSafari(ua)


export const detectBrowser = function (user_agent: string, vendor: string | undefined): string {
    vendor = vendor || '' // vendor is undefined for at least IE9

    if (includes(user_agent, ' OPR/') && includes(user_agent, 'Mini')) {
        return OPERA_MINI
    } else if (includes(user_agent, ' OPR/')) {
        return OPERA
    } else if (BLACKBERRY_REGEX.test(user_agent)) {
        return BLACKBERRY
    } else if (includes(user_agent, 'IE' + MOBILE) || includes(user_agent, 'WPDesktop')) {
        return INTERNET_EXPLORER_MOBILE
    }
    // https://developer.samsung.com/internet/user-agent-string-format
    else if (includes(user_agent, SAMSUNG_BROWSER)) {
        return SAMSUNG_INTERNET
    } else if (includes(user_agent, EDGE) || includes(user_agent, 'Edg/')) {
        return MICROSOFT_EDGE
    } else if (includes(user_agent, 'FBIOS')) {
        return FACEBOOK + ' ' + MOBILE
    } else if (includes(user_agent, 'UCWEB') || includes(user_agent, 'UCBrowser')) {
        return 'UC Browser'
    } else if (includes(user_agent, 'CriOS')) {
        return CHROME_IOS // why not just Chrome?
    } else if (includes(user_agent, 'CrMo')) {
        return CHROME
    } else if (includes(user_agent, ANDROID) && includes(user_agent, SAFARI)) {
        return ANDROID_MOBILE
    } else if (includes(user_agent, CHROME)) {
        return CHROME
    } else if (includes(user_agent, 'FxiOS')) {
        return FIREFOX_IOS
    } else if (includes(user_agent.toLowerCase(), KONQUEROR.toLowerCase())) {
        return KONQUEROR
    } else if (safariCheck(user_agent, vendor)) {
        return includes(user_agent, MOBILE) ? MOBILE_SAFARI : SAFARI
    } else if (includes(user_agent, FIREFOX)) {
        return FIREFOX
    } else if (includes(user_agent, 'MSIE') || includes(user_agent, 'Trident/')) {
        return INTERNET_EXPLORER
    } else if (includes(user_agent, 'Gecko')) {
        return FIREFOX
    }

    return ''
}



export const detectDevice = function (user_agent: string): string {
    if (NINTENDO_REGEX.test(user_agent)) {
        return NINTENDO
    } else if (PLAYSTATION_REGEX.test(user_agent)) {
        return PLAYSTATION
    } else if (XBOX_REGEX.test(user_agent)) {
        return XBOX
    } else if (new RegExp(OUYA, 'i').test(user_agent)) {
        return OUYA
    } else if (new RegExp('(' + WINDOWS_PHONE + '|WPDesktop)', 'i').test(user_agent)) {
        return WINDOWS_PHONE
    } else if (/iPad/.test(user_agent)) {
        return IPAD
    } else if (/iPod/.test(user_agent)) {
        return 'iPod Touch'
    } else if (/iPhone/.test(user_agent)) {
        return 'iPhone'
    } else if (/(watch)(?: ?os[,/]|\d,\d\/)[\d.]+/i.test(user_agent)) {
        return APPLE_WATCH
    } else if (BLACKBERRY_REGEX.test(user_agent)) {
        return BLACKBERRY
    } else if (/(kobo)\s(ereader|touch)/i.test(user_agent)) {
        return 'Kobo'
    } else if (new RegExp(NOKIA, 'i').test(user_agent)) {
        return NOKIA
    } else if (
        // Kindle Fire without Silk / Echo Show
        /(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i.test(user_agent) ||
        // Kindle Fire HD
        /(kf[a-z]+)( bui|\)).+silk\//i.test(user_agent)
    ) {
        return 'Kindle Fire'
    } else if (/(Android|ZTE)/i.test(user_agent)) {
        if (
            !new RegExp(MOBILE).test(user_agent) ||
            /(9138B|TB782B|Nexus [97]|pixel c|HUAWEISHT|BTV|noble nook|smart ultra 6)/i.test(user_agent)
        ) {
            if (
                (/pixel[\daxl ]{1,6}/i.test(user_agent) && !/pixel c/i.test(user_agent)) ||
                /(huaweimed-al00|tah-|APA|SM-G92|i980|zte|U304AA)/i.test(user_agent) ||
                (/lmy47v/i.test(user_agent) && !/QTAQZ3/i.test(user_agent))
            ) {
                return ANDROID
            }
            return ANDROID_TABLET
        } else {
            return ANDROID
        }
    } else if (new RegExp('(pda|' + MOBILE + ')', 'i').test(user_agent)) {
        return GENERIC_MOBILE
    } else if (new RegExp(TABLET, 'i').test(user_agent) && !new RegExp(TABLET + ' pc', 'i').test(user_agent)) {
        return GENERIC_TABLET
    } else {
        return ''
    }
}

export const detectDeviceType = function (user_agent: string): string {
    const device = detectDevice(user_agent)
    if (
        device === IPAD ||
        device === ANDROID_TABLET ||
        device === 'Kobo' ||
        device === 'Kindle Fire' ||
        device === GENERIC_TABLET
    ) {
        return TABLET
    } else if (device === NINTENDO || device === XBOX || device === PLAYSTATION || device === OUYA) {
        return 'Console'
    } else if (device === APPLE_WATCH) {
        return 'Wearable'
    } else if (device) {
        return MOBILE
    } else {
        return 'Desktop'
    }
}