export declare const CAMPAIGN_PARAMS: string[];
declare function campaignParamsFuction(): Record<string, any>;
declare function detectIPFunction(): Promise<any>;
export declare const Info: {
    campaignParams: typeof campaignParamsFuction;
    detectOS: (user_agent: string) => [string, string];
    detectBrowser: (user_agent: string, vendor: string | undefined) => string;
    detectBrowserLanguage: () => any;
    detectDevice: (user_agent: string) => string;
    detectDeviceType: (user_agent: string) => string;
    detectIP: typeof detectIPFunction;
};
export {};
