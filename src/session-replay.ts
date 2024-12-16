// @ts-ignore
// session-replay.ts
import rrwebRecord from "rrweb/es/rrweb/packages/rrweb/src/record";
import { errorplugin } from "./plugins/error";
import { revenuePlugin } from "./plugins/revenue";
import { clickedElementPlugin } from "./plugins/clickedElement";
import { ga4Plugin } from "./plugins/ga4";
import { marketingPlugin } from "./plugins/marketingTracking";
import { EventType, eventWithTime, recordOptions } from "rrweb";
import { UAPlugin } from "./plugins/userAgentDetection";
import { MutationRateLimiter } from "./optimizations/mutationLimiter";
import { estimateSize } from "./utils/compress";
import { Queue } from "./optimizations/queue";

export interface SnapshotBuffer {
  size: number;
  data: eventWithTime[] | string;
  partitionKey: string;
  stream_key: string;
  splitFullSnapshot?: boolean;
}

export class SessionReplay {
  private static instance: SessionReplay;
  private static intervalSet: boolean = false;

  record = false;
  events: any[];
  buffer: SnapshotBuffer | undefined;
  mutationRateLimiter: MutationRateLimiter;
  rrwebRecord;
  stream_key: string | null;
  session_id: string | null;
  queue: Queue;
  fullSnapshotExists: boolean = false;

  private constructor(record: boolean) {
    this.events = [];
    this.stream_key = null;
    this.session_id = null;

    this.record = record;
    this.rrwebRecord = rrwebRecord;
    this.mutationRateLimiter = new MutationRateLimiter(this.rrwebRecord, {
      onBlockedNode: (id, _) => {
        const message = `Too many mutations on node '${id}'. Rate limiting. This could be due to SVG animations or something similar`;
        //console.warn(message, node);
      },
    });

    this.queue = new Queue(this);
    if (!SessionReplay.intervalSet) {
      setInterval(this._emit.bind(this), 3000);
      SessionReplay.intervalSet = true;
    }
  }

  public static getInstance(record: boolean): SessionReplay {
    if (!SessionReplay.instance) {
      SessionReplay.instance = new SessionReplay(record);
    } else if (record !== SessionReplay.instance.record) {
      SessionReplay.instance.record = record;
    }
    return SessionReplay.instance;
  }

  set_keys = (stream_key: string, session_id: string) => {
    this.stream_key = stream_key;
    this.session_id = session_id;
  };

  private _emit = () => {
    if (
      this.record &&
      this.events.length > 0 &&
      this.stream_key &&
      this.session_id
    ) {
      const payload: SnapshotBuffer = {
        size: estimateSize(this.events),
        data: this.events,
        partitionKey: this.session_id,
        stream_key: this.stream_key,
      };

      this.fullSnapshotExists = false;
      if (
        typeof this.events[0] === "string" &&
        this.events[0] === "fullsnapshot"
      ) {
        this.fullSnapshotExists = true;
      }

      this.queue.addPackets(payload, this.fullSnapshotExists);

      this.events = [];
    }
  };

  start_recording(is_eu: boolean) {
    const rrwebOptions: recordOptions<eventWithTime> = {
      emit: (event: eventWithTime) => {
        const throttledEvent =
          this.mutationRateLimiter.throttleMutations(event);
        const controlledEvent = throttledEvent ? throttledEvent : event;
        if (controlledEvent.type === EventType.FullSnapshot) {
          this.events.unshift("fullsnapshot");
        }
        this.events.push(controlledEvent);
        marketingPlugin(controlledEvent, this.events);
      },
      sampling: {
        mouseInteraction: {
          MouseUp: false,
          MouseDown: false,
          ContextMenu: false,
          Focus: false,
          Blur: false,
          TouchStart: false,
          TouchEnd: false,
          TouchMove: false,
          Click: true,
        },
      },
      maskInputOptions: {
        password: true,
      },
      maskAllInputs: false,
      plugins: [
        errorplugin,
        clickedElementPlugin,
        ga4Plugin,
        UAPlugin,
        revenuePlugin,
      ],
    };

    if (is_eu) {
      rrwebOptions.maskAllInputs = true;
      rrwebOptions.maskInputOptions = {
        password: true,
        text: true,
        email: true,
        tel: true,
        search: true,
        url: true,
        color: true,
        date: true,
        "datetime-local": true,
        month: true,
        number: true,
        range: true,
        time: true,
        week: true,
        textarea: true,
        select: true,
      };

      rrwebOptions.maskTextClass = "*";
      rrwebOptions.maskTextSelector = "*";
      rrwebOptions.maskTextFn = (text: string) => "*".repeat(text.length);

      rrwebOptions.blockClass = "rrweb-profile-img";
      rrwebOptions.blockSelector = 'img[src*="profile"], img[src*="avatar"]';
    }

    this.rrwebRecord(rrwebOptions);
  }
}
