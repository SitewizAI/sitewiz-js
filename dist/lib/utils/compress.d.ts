import { SnapshotBuffer } from "../session-replay";
import { eventWithTime } from "rrweb";
export declare const SEVEN_MEGABYTES: number;
export declare function estimateSize(sizeable: unknown): number;
export declare function splitBuffer(buffer: SnapshotBuffer, sizeLimit?: number): SnapshotBuffer[];
export declare const compressData: (data: eventWithTime[], stream_key: string) => string;
export declare const splitFullSnapshotCompressed: (data: eventWithTime[], partitionKey: string, stream_key: string) => SnapshotBuffer[];
