import { RecordPlugin } from "rrweb/es/rrweb/packages/rrweb/src/plugins";
declare global {
    interface Window {
        dataLayer: any[];
    }
}
export declare const revenuePlugin: RecordPlugin;
