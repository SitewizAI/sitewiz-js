import { isArray, isObject } from "./type-utils"
import { SnapshotBuffer } from "../session-replay"
import { deflateSync } from 'fflate'
import { eventWithTime } from "rrweb"
import { event } from "@rrweb/types"

const CONTENT_TYPE_PLAIN = 'text/plain'
export const SEVEN_MEGABYTES = 1024 * 1024 * 7 * 0.9 // ~7mb (with some wiggle room)




function circularReferenceReplacer() {
  const ancestors: any[] = []
  return function (_key: string, value: any) {
      if (isObject(value)) {
          // `this` is the object that value is contained in,
          // i.e., its direct parent.
          // @ts-expect-error - TS was unhappy with `this` on the next line but the code is copied in from MDN
          while (ancestors.length > 0 && ancestors.at(-1) !== this) {
              ancestors.pop()
          }
          if (ancestors.includes(value)) {
              return '[Circular]'
          }
          ancestors.push(value)
          return value
      } else {
          return value
      }
  }
}

export function estimateSize(sizeable: unknown): number {
  return JSON.stringify(sizeable, circularReferenceReplacer()).length
}


export function splitBuffer(buffer: SnapshotBuffer, sizeLimit: number = SEVEN_MEGABYTES): SnapshotBuffer[] {
    if (buffer.size >= sizeLimit && isArray(buffer.data) && buffer.data.length > 1) {
        const half = Math.floor(buffer.data.length / 2)
        const firstHalf = buffer.data.slice(0, half)
        const secondHalf = buffer.data.slice(half)
        return [
            splitBuffer({
                size: estimateSize(firstHalf),
                data: firstHalf,
                partitionKey: buffer.partitionKey,
                stream_key: buffer.stream_key
            }),
            splitBuffer({
                size: estimateSize(secondHalf),
                data: secondHalf,
                partitionKey: buffer.partitionKey,
                stream_key: buffer.stream_key
            }),
        ].flatMap((x) => x)
    } 
    
    return [buffer];
}


const maxSizeInBytes = 1 * 1024 * 1020; // Convert MB to bytes

// function uint8ArrayToBase64(data: Uint8Array) {
//     const binaryString = String.fromCharCode(...data);
//     return btoa(binaryString);
// }

function uint8ArrayToBase64(bytes: Uint8Array) {
    let binaryString = "";
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binaryString += String.fromCharCode(bytes[i]);
    }
    return btoa(binaryString);
  }



export const compressData = (data: eventWithTime[], stream_key: string) : string => {
    const events = {data, stream_key}  ;
    const jsonString = JSON.stringify(events);
    const compressedData = deflateSync(new TextEncoder().encode(jsonString));
    return uint8ArrayToBase64(compressedData);
}

export const splitFullSnapshotCompressed = (data: eventWithTime[], partitionKey: string, stream_key: string) : SnapshotBuffer[] => {
    const compressed = compressData(data, stream_key);
    const result : SnapshotBuffer[] = [];
    const maxCharsPerChunk = Math.floor(maxSizeInBytes / 2);

    let start = 0;

    while (start < compressed.length) {
        const end = Math.min(start + maxCharsPerChunk, compressed.length);
        const chunk = compressed.substring(start, end);

        const bufferChunk : SnapshotBuffer = {
            size: chunk.length,
            data: chunk,
            partitionKey: partitionKey,
            stream_key: stream_key,
            splitFullSnapshot: true
        }

        result.push(bufferChunk);
        start = end;
    }

    return result;
}