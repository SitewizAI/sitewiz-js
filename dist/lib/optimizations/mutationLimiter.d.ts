import type { eventWithTime, listenerHandler } from '@rrweb/types';
import { Mirror } from 'rrdom';
import { recordOptions } from 'rrweb';
type rrwebRecord = {
    (options: recordOptions<eventWithTime>): listenerHandler;
    addCustomEvent: (tag: string, payload: any) => void;
    takeFullSnapshot: () => void;
    mirror: Mirror;
};
export declare class MutationRateLimiter {
    private readonly rrweb;
    private readonly options;
    private bucketSize;
    private refillRate;
    private mutationBuckets;
    private loggedTracker;
    constructor(rrweb: rrwebRecord, options?: {
        bucketSize?: number;
        refillRate?: number;
        onBlockedNode?: (id: number, node: Node | null) => void;
    });
    private refillBuckets;
    private getNodeOrRelevantParent;
    private numberOfChanges;
    throttleMutations: (event: eventWithTime) => eventWithTime | null;
}
export {};
