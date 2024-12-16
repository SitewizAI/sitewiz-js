import { eventWithTime } from "rrweb";
import { MutationRateLimiter } from "./optimizations/mutationLimiter";
import { Queue } from "./optimizations/queue";
export interface SnapshotBuffer {
    size: number;
    data: eventWithTime[] | string;
    partitionKey: string;
    stream_key: string;
    splitFullSnapshot?: boolean;
}
export declare class SessionReplay {
    private static instance;
    private static intervalSet;
    record: boolean;
    events: any[];
    buffer: SnapshotBuffer | undefined;
    mutationRateLimiter: MutationRateLimiter;
    rrwebRecord: any;
    stream_key: string | null;
    session_id: string | null;
    queue: Queue;
    fullSnapshotExists: boolean;
    private constructor();
    static getInstance(record: boolean): SessionReplay;
    set_keys: (stream_key: string, session_id: string) => void;
    private _emit;
    start_recording(is_eu: boolean): void;
}
