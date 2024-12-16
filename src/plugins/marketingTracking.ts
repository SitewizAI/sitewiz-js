import { eventWithTime, EventType } from 'rrweb';
import { Info } from '../utils/event-utils';


export const marketingPlugin = (event: eventWithTime, allevents: eventWithTime[]) => {
    if(event.type == EventType.Meta){
        const params = Info.campaignParams();
        const payload : eventWithTime = {
            type: EventType.Plugin,
            data: {
                plugin: "sitewiz/marketing@1",
                payload: params
            },
            timestamp: Date.now()
        }

        allevents.push(payload);
    }
}
