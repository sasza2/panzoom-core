import getWindow from './getWindow';
import isEventMobileZoom from './isEventMobileZoom';

type EventNames = Array<
  | 'mousedown'
  | 'mouseup'
  | 'touchstart'
  | 'touchend'
  | 'touchcancel'
  | 'mousemove'
  | 'touchmove'
>;

type Callback = (e: MouseEvent) => void;

type EventListenerClean = () => void;

const eventListener = (
  node: Window | HTMLDivElement,
  eventNames: EventNames,
  callback: Callback,
): EventListenerClean => {
  eventNames.forEach((eventName) => {
    node.addEventListener(eventName, callback);
  });

  return () => {
    eventNames.forEach((eventName) => {
      node.removeEventListener(eventName, callback);
    });
  };
};

export const onMouseDown = (
  node: HTMLDivElement,
  callback: Callback,
): EventListenerClean => eventListener(node, ['mousedown', 'touchstart'], callback);

export const onMouseUp = (
  node: Window | HTMLDivElement,
  callback: Callback,
): EventListenerClean => {
  const cleanMouseUp = eventListener(getWindow(), ['mouseup'], callback);
  const cleanTouch = eventListener(node, ['touchend', 'touchcancel'], callback);
  return () => {
    cleanMouseUp();
    cleanTouch();
  };
};

export const onMouseMove = (callback: Callback): EventListenerClean => {
  const cleanMouseMove = eventListener(getWindow(), ['mousemove'], callback);

  const callbackMobileWrapper: Callback = (e) => {
    if (isEventMobileZoom(e)) return;

    callback(e);
  };

  const cleanTouchMove = eventListener(getWindow(), ['touchmove'], callbackMobileWrapper);

  return () => {
    cleanMouseMove();
    cleanTouchMove();
  };
};
