import { EventType, eventWithTime } from "rrweb";
import { SessionReplay, SnapshotBuffer } from "../session-replay";
import { compressData, estimateSize, splitBuffer, splitFullSnapshotCompressed } from "../utils/compress";
import { isLocalhost } from "../utils/request-utils";
import { isArray } from "../utils/type-utils";


// Additional wrapping for processing buffers
interface DataPacket {
    buffer: SnapshotBuffer, 
    fullSnapshot: boolean,
    retryCount?: number
}


export class Queue {
    packets: DataPacket[] = [];
    recorder: SessionReplay;
    processing: boolean = false;
    maxRetries = 5;
    baseDelay = 500;
    sending = false;
    local = false;

    constructor (recorder: SessionReplay){
        this.recorder = recorder;
        this.local = isLocalhost();
        this.poll();
    }


    delay = (delayInms: number) => {
        return new Promise(resolve => setTimeout(resolve, delayInms));
    };
      
    async poll () {
        setInterval(async () => {
            if (!this.processing && !this.sending){
                this.processing = true;
                const packet = this.packets.shift();
                if (packet){
                    this.sendPackets (packet);
                }
                
                this.processing = false;  
            }
        }, 500);
        
    }

    isFullPageSnapshot = (event: eventWithTime) : boolean => {
        return event.type === EventType.FullSnapshot;
    }

    splitBySnapshot = (data: eventWithTime[]) => {
        const result = [];
        let startIndex = 0;
    
        for (let i = 0; i < data.length; i++) {
            if (this.isFullPageSnapshot(data[i])) {
                if (startIndex < i) {
                    result.push(data.slice(startIndex, i)); // Before the key
                }

                result.push(data.slice(i, i + 1)); // The matching key
                startIndex = i + 1;
            }
        }
    
        if (startIndex < data.length) {
            result.push(data.slice(startIndex)); // After the last key
        }
    
        return result;
    }
    

    // Splits packets in a buffer
    // If its a fullpage snapshot, isolates the snapshot from other data events
    // Otherwise, splits data events into chunks if too large

    bufferToDatapacket = (data: SnapshotBuffer[], snapshot: boolean) => {
        const packets: DataPacket[] = [];
        data.forEach(buffer => {
            const datapacket = {
                buffer: buffer,
                fullSnapshot: snapshot,
            }

            packets.push(datapacket);
        });

        return packets;
    }

    processPacket = (packet: DataPacket) : SnapshotBuffer[] => {

        const stream_key = packet.buffer.stream_key;
        const partitionKey = packet.buffer.partitionKey;

        if (packet.fullSnapshot && isArray(packet.buffer.data)){
            packet.buffer.data.shift();
            
            const splits = this.splitBySnapshot(packet.buffer.data);
            const buffers : SnapshotBuffer[] = [];
            splits.forEach(split => {

                if(this.isFullPageSnapshot(split[0])){
                    const compressed = splitFullSnapshotCompressed(split, partitionKey, stream_key);
                    buffers.push(...compressed);
                }
                else{
                    const bufferPayload: SnapshotBuffer= {
                        size: estimateSize(split),
                        data: split,
                        partitionKey: packet.buffer.partitionKey,
                        stream_key: packet.buffer.stream_key
                    }
                    buffers.push(bufferPayload);
                }

            });

            return buffers;
        }

        else if (!isArray(packet.buffer.data)){
            return [packet.buffer];
        }
        else{
            const buffers = splitBuffer(packet.buffer);
            return buffers;
        }
    }


    // Split and process packets
    // If packet has been split, readd to the queue
    // If packet isn't split, send it to backend
    sendPackets = (packet: DataPacket) => {
        const processedPacket = this.processPacket(packet);
        if (processedPacket.length > 1) {
            processedPacket.slice().reverse().forEach(proc => {
                this.packets.unshift({buffer: proc, fullSnapshot: false});
            });
            return;
        }


        const compressedEvents = typeof processedPacket[0].data !== 'string' ?
                        compressData(processedPacket[0].data, processedPacket[0].stream_key) :
                        processedPacket[0].data;

        const fullPageSnapshot = processedPacket[0].splitFullSnapshot ? true : false;
        const data = {events: compressedEvents, 
                      fullPageSnapshot, 
                      stream_key: processedPacket[0].stream_key,
                      session: processedPacket[0].partitionKey};

        const url = this.local ? 'https://webhook.site/a5725c69-7db0-4d59-ab0b-9eb199a4d765' : 'https://3c1vg79qm1.execute-api.us-east-1.amazonaws.com/prod/record';

        const headers: Record<string, string> = {
            "Content-Type": "application/json;charset=UTF-8",
            "Accept": "*/*",
            "Connection": "Keep-Alive"
        };
    

        if (!this.local) {
            headers["X-API-KEY"] = processedPacket[0].stream_key;
        }

        const body = JSON.stringify({partitionKey: processedPacket[0].partitionKey, data})
        const fetchOptions: RequestInit = {
            method: "POST",
            headers: headers,
            body: body
        };
    
        if (this.local) {
            fetchOptions.mode = 'no-cors';
        }
    

        this.sending = true;
        fetch(url, fetchOptions).then(
                async response => {
                    if (!response.ok && response.type !== 'opaque') {
                        packet.retryCount = (packet.retryCount || 0) + 1;

                        if (packet.retryCount <= this.maxRetries) {
                            const delay = this.baseDelay * Math.pow(2, packet.retryCount);
                            if (this.local){
                                console.log(`Retrying in ${delay} ms (Attempt ${packet.retryCount}/${this.maxRetries})`);
                            }
                            
                            await this.delay(delay);
                            this.packets.unshift(packet); // Re-add packet to the queue
                        } else {
                            if (this.local){
                                console.error('Max retries reached. Dropping packet:', packet);
                            }
                            
                        }
                    }

                    this.sending = false;
                }
            );
        
    }

    addPackets = (events: SnapshotBuffer, fullSnapshot : boolean) => {
        const clonedEvents: SnapshotBuffer = JSON.parse(JSON.stringify(events));

        if (this.local){
            console.log(clonedEvents.data);
            console.log(fullSnapshot);
        }

        this.packets.push({buffer: clonedEvents, fullSnapshot});
    }


}