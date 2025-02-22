import { ZoomEvent } from 'types';

const EVENT_THROTTLE_TIME = 50; // ms
const ZOOM_EVENT_TOUCHES_COUNT = 2;

const calculateDistance = (x1: number, y1: number, x2: number, y2: number) => {
  const x = Math.abs(x1 - x2);
  const y = Math.abs(y1 - y2);

  return Math.sqrt(x * x + y * y);
};

const calculateTouchPointsDistance = (touches: TouchList) => calculateDistance(
  touches.item(0).clientX,
  touches.item(0).clientY,
  touches.item(1).clientX,
  touches.item(1).clientY,
);

const getCenterClientXYFromTouches = (touches: TouchList): [number, number ] => {
  let clientX = 0;
  let clientY = 0;

  for (let i = 0; i < touches.length; i++) {
    clientX += touches.item(i).clientX;
    clientY += touches.item(i).clientY;
  }

  clientX /= touches.length;
  clientY /= touches.length;

  return [clientX, clientY];
};

type TouchEventToZoomInit = () => [(e: TouchEvent) => ZoomEvent, () => void];

const touchEventToZoomInit: TouchEventToZoomInit = () => {
  let lastDistanceBetweenTouchPoints: number | null = null;
  let lastCenterX: number | null = null;
  let lastCenterY: number | null = null;
  let timer: ReturnType<typeof setTimeout> = null;

  const transform = (e: TouchEvent): ZoomEvent => {
    if (e.touches.length !== ZOOM_EVENT_TOUCHES_COUNT) return null;

    e.preventDefault();
    e.stopPropagation();

    const [centerX, centerY] = getCenterClientXYFromTouches(e.touches);

    let deltaDistanceBetweenCenterXY: number | null = null;

    if (lastCenterX !== null && lastCenterY !== null) {
      deltaDistanceBetweenCenterXY = calculateDistance(centerX, centerY, lastCenterX, lastCenterY);
    }

    const distanceBetweenTouchPoints = calculateTouchPointsDistance(e.touches);

    if (!timer) {
      timer = setTimeout(() => {
        lastDistanceBetweenTouchPoints = distanceBetweenTouchPoints;
        timer = null;
        lastCenterX = centerX;
        lastCenterY = centerY;
      }, EVENT_THROTTLE_TIME);
    }

    if (deltaDistanceBetweenCenterXY === null) {
      return null;
    }

    const deltaDistanceBetweenTouchPoints = Math.abs(
      distanceBetweenTouchPoints - lastDistanceBetweenTouchPoints,
    );

    if (deltaDistanceBetweenTouchPoints < deltaDistanceBetweenCenterXY) {
      return null;
    }

    const shouldKeepSameZoom = lastDistanceBetweenTouchPoints === null
      || Math.round(distanceBetweenTouchPoints) === Math.round(lastDistanceBetweenTouchPoints);

    if (shouldKeepSameZoom) {
      return {
        deltaY: 0,
        clientX: centerX,
        clientY: centerY,
        isTouchEvent: true,
      };
    }

    return {
      deltaY: distanceBetweenTouchPoints > lastDistanceBetweenTouchPoints ? -1 : 1,
      clientX: centerX,
      clientY: centerY,
      isTouchEvent: true,
    };
  };

  const reset = () => {
    lastDistanceBetweenTouchPoints = null;
    lastCenterX = null;
    lastCenterY = null;
    clearTimeout(timer);
    timer = null;
  };

  return [transform, reset];
};

export default touchEventToZoomInit;
