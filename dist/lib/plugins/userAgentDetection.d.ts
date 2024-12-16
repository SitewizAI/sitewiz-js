import { eventWithTime } from "rrweb";
export declare const UAPlugin: {
    name: string;
    observer: (cb: (event: eventWithTime) => void) => Promise<() => void>;
    option: {};
    reset: () => void;
};
