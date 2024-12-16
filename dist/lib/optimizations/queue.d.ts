import { eventWithTime } from "rrweb";
import { SessionReplay, SnapshotBuffer } from "../session-replay";
interface DataPacket {
    buffer: SnapshotBuffer;
    fullSnapshot: boolean;
    retryCount?: number;
}
export declare class Queue {
    packets: DataPacket[];
    recorder: SessionReplay;
    processing: boolean;
    maxRetries: number;
    baseDelay: number;
    sending: boolean;
    local: boolean;
    constructor(recorder: SessionReplay);
    delay: (delayInms: number) => Promise<unknown>;
    poll(): Promise<void>;
    isFullPageSnapshot: (event: eventWithTime) => boolean;
    splitBySnapshot: (data: eventWithTime[]) => eventWithTime[][];
    bufferToDatapacket: (data: SnapshotBuffer[], snapshot: boolean) => DataPacket[];
    processPacket: (packet: DataPacket) => SnapshotBuffer[];
    sendPackets: (packet: DataPacket) => void;
    addPackets: (events: SnapshotBuffer, fullSnapshot: boolean) => void;
}
export {};
