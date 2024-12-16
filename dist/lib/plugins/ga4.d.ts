import { eventWithTime } from 'rrweb';
export declare const ga4Plugin: {
    name: string;
    observer: (cb: (event: eventWithTime) => void) => () => void;
    options: {};
    reset: () => void;
};
