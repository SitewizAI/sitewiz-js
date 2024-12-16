export declare const osMatchers: [
    RegExp,
    [
        string,
        string
    ] | ((match: RegExpMatchArray | null, user_agent: string) => [string, string])
][];
export declare const detectBrowser: (user_agent: string, vendor: string | undefined) => string;
export declare const detectDevice: (user_agent: string) => string;
export declare const detectDeviceType: (user_agent: string) => string;
