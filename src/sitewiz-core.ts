import { getSessionId } from "./utils/cookies";
import { SessionReplay } from "./session-replay";

export class Sitewiz {
  record: boolean = false;
  funnel: boolean;
  compress: boolean = true;
  replay: SessionReplay;
  gdpr: boolean = false;
  stream_key: string = "";

  constructor() {
    this.funnel = true;

    const recordingThreshold = 0;
    if (Math.random() > recordingThreshold) {
      this.record = true;
    }

    this.replay = SessionReplay.getInstance(this.record);
  }

  begin(stream_key: string) {
    if (this.gdpr) {
      // Implement PII masking logic here
    }
    const sessionId = getSessionId();
    this.replay.set_keys(stream_key, sessionId[0]);
    this.replay.record = true;
    const is_eu = false;
    this.replay.start_recording(is_eu);
  }

  dom_loaded_handler() {
    if (document?.addEventListener) {
      if (document.readyState === "complete") {
        // Safari 4 can fire the DOMContentLoaded event before loading all
        // external JS (including this file). You will see some copypasta
        // on the internet that checks for 'complete' and 'loaded', but
        // 'loaded' is an IE thing.
        this.begin(this.stream_key);
      } else {
        document.addEventListener("DOMContentLoaded", () =>
          this.begin(this.stream_key)
        );
      }
    }
  }

  init(stream_key: string, gtm?: boolean) {
    this.stream_key = stream_key;

    if (gtm) {
      this.begin(this.stream_key);
    } else {
      window.addEventListener("load", this.dom_loaded_handler.bind(this), true);
    }
  }
}
