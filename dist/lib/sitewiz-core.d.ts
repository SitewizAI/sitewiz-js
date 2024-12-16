import { SessionReplay } from "./session-replay";
export declare class Sitewiz {
    record: boolean;
    funnel: boolean;
    compress: boolean;
    replay: SessionReplay;
    gdpr: boolean;
    stream_key: string;
    constructor();
    begin(stream_key: string): void;
    dom_loaded_handler(): void;
    init(stream_key: string, gtm?: boolean): void;
}
