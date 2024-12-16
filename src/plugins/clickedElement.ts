//@ts-ignore
import { RecordPlugin } from "rrweb/es/rrweb/packages/rrweb/src/plugins";
//@ts-ignore
import { eventWithTime } from "rrweb/typings/types";

function getXPath(element: HTMLElement, depth: number): string {
  if (depth == 100) {
    return "<UNK>";
  }

  if (element.id !== "") {
    return `//*[@id="${element.id}"]`;
  }
  if (element === document.body) {
    return "/html/body";
  }

  let ix = 0;
  const siblings = element.parentNode?.childNodes;
  if (siblings) {
    for (let i = 0; i < siblings.length; i++) {
      const sibling = siblings[i];
      if (sibling === element) {
        return (
          getXPath(element.parentNode as HTMLElement, depth + 1) +
          "/" +
          element.tagName.toLowerCase() +
          `[${ix + 1}]`
        );
      }
      if (sibling.nodeType === 1 && sibling.nodeName === element.nodeName) {
        ix++;
      }
    }
  }
  return "";
}

export const clickedElementPlugin: RecordPlugin<{ foo: string }> = {
  name: "sitewiz/clickedElement@1",
  observer: (cb: (event: eventWithTime) => void, doc: Document) => {
    const clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const clickEvent = {
        type: "click",
        timestamp: Date.now(),
        target: target.tagName,
        outerHTML: target.outerHTML,
        xPath: getXPath(target, 0),
        x: event.clientX,
        y: event.clientY,
      };
      cb(clickEvent as unknown as eventWithTime);
    };

    const hoverHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const hoverEvent = {
        type: "hover",
        timestamp: Date.now(),
        target: target.tagName,
        xPath: getXPath(target, 0),
        x: event.clientX,
        y: event.clientY,
      };
      cb(hoverEvent as unknown as eventWithTime);
    };

    doc.addEventListener("click", clickHandler);
    doc.addEventListener("mouseover", hoverHandler);

    // Return a cleanup function
    return () => {
      doc.removeEventListener("click", clickHandler);
      doc.removeEventListener("mouseover", hoverHandler);
    };
  },
  options: {},
  reset: () => {},
};
