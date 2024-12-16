// @ts-ignore
import { RecordPlugin } from "rrweb/es/rrweb/packages/rrweb/src/plugins";
// @ts-ignore
import { eventWithTime } from "rrweb/typings/types";

// Extend the Window interface to include dataLayer
declare global {
  interface Window {
    dataLayer: any[];
  }
}

// Function to track data layer changes, similar to what you had in the previous script
function trackDataLayerChanges(cb: (event: eventWithTime) => void) {
  // Ensure window exists and has a dataLayer property
  if (
    typeof window !== "undefined" &&
    window.dataLayer &&
    window.dataLayer.push
  ) {
    const originalPush = window.dataLayer.push;
    window.dataLayer.push = function (...args: any[]) {
      Array.prototype.forEach.call(args, (event) => {
        try {
          const normalizedEvent = normalizeEventName(event.event);

          const ecommerceEvents = [
            "add_to_cart",
            "remove_from_cart",
            "begin_checkout",
            "purchase",
          ];
          if (ecommerceEvents.includes(normalizedEvent)) {
            const dataLayerEvent = {
              type: "custom",
              data: {
                tag: normalizedEvent,
                payload: event,
              },
              timestamp: Date.now(),
            };
            cb(dataLayerEvent as unknown as eventWithTime);
          }
        } catch (e) {
          //console.error("Error processing dataLayer event", e);
        }
      });
      return originalPush.apply(window.dataLayer, args);
    };
  }
}

// Normalizes event names
function normalizeEventName(eventName: string): string {
  const eventMapping: { [key: string]: string } = {
    addToCart: "add_to_cart",
    add_to_cart: "add_to_cart",
    removeFromCart: "remove_from_cart",
    remove_from_cart: "remove_from_cart",
    beginCheckout: "begin_checkout",
    begin_checkout: "begin_checkout",
    purchase: "purchase",
    transaction: "purchase",
  };
  return eventMapping[eventName] || eventName;
}

export const revenuePlugin: RecordPlugin = {
  name: "custom/revenue@1",

  // This observer will listen for events
  observer(cb: (event: eventWithTime) => void) {
    trackDataLayerChanges(cb);

    // Return a cleanup function if necessary
    return () => {
      // Cleanup code if necessary
    };
  },

  options: {},

  reset: () => {},
};
