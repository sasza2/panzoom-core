import {
  ZOOM_DESKTOP_THROTTLE_DURATION,
  ZOOM_NON_DESKTOP_THROTTLE_DURATION,
  ZOOM_NON_DESKTOP_MOVING_BLOCK_DELAY,
} from '@/consts';
import { Zoom, ZoomEvent } from 'types';
import { useEffect } from '@/helpers/effects'
import getBoundingClientRect from '@/helpers/getBoundingClientRect';
import isEventMobileZoom from '@/helpers/isEventMobileZoom';
import produceStyle from '@/helpers/produceStyle';
import produceBounding from '@/helpers/produceBounding';
import produceNextZoom from '@/helpers/produceNextZoom';
import touchEventToZoomInit from '@/helpers/touchEventToZoomInit';
import throttle from '@/helpers/throttle';
import { usePanZoom } from '@/panZoomProvider'

const useZoom = (): Zoom => {
  const {
    blockMovingRef,
    boundary,
    childNode,
    containerNode,
    disabled,
    disabledZoom,
    positionRef,
    onContainerChangeRef,
    onContainerZoomChangeRef,
    zoomInitial,
    zoomMax,
    zoomMin,
    zoomRef,
    zoomSpeed,
  } = usePanZoom();

  const dependencies = [
    JSON.stringify(boundary),
    disabled,
    disabledZoom,
    zoomInitial,
    zoomSpeed,
    zoomMax,
    zoomMin,
  ];

  useEffect(() => {
    if (disabled || disabledZoom) return undefined;

    const isMobile = 'ontouchstart' in window;

    const [touchEventToZoom, resetTouchEvent] = touchEventToZoomInit();
    let blockTimer: ReturnType<typeof setTimeout> = null;

    const wheelFunc = (e: ZoomEvent) => {
      const parentRect = getBoundingClientRect(containerNode);
      const childRect = getBoundingClientRect(childNode);

      if (isMobile) {
        clearTimeout(blockTimer);
        blockTimer = setTimeout(() => {
          blockMovingRef.current = false;
        }, ZOOM_NON_DESKTOP_MOVING_BLOCK_DELAY);

        blockMovingRef.current = true;
      }

      const xOffset = (e.clientX - parentRect.left - positionRef.current.x) / zoomRef.current;
      const yOffset = (e.clientY - parentRect.top - positionRef.current.y) / zoomRef.current;

      const nextZoom = produceNextZoom({
        e,
        isMobile,
        zoomRef,
        zoomSpeed,
        zoomMin,
        zoomMax,
      });

      const prevZoom = zoomRef.current;
      zoomRef.current = nextZoom;

      const nextPosition = produceBounding({
        boundary,
        x: e.clientX - parentRect.left - xOffset * nextZoom,
        y: e.clientY - parentRect.top - yOffset * nextZoom,
        parentSize: parentRect,
        childSize: {
          width: childRect.width * (nextZoom / prevZoom),
          height: childRect.height * (nextZoom / prevZoom),
        },
      });

      positionRef.current = nextPosition;
      childNode.style.transform = produceStyle({ position: nextPosition, zoom: nextZoom });
      childNode.style.setProperty('--zoom', nextZoom.toString());

      if (onContainerChangeRef.current) {
        onContainerChangeRef.current({ position: { ...positionRef.current }, zoom: nextZoom });
      }
      if (onContainerZoomChangeRef.current) {
        onContainerZoomChangeRef.current({ zoom: nextZoom, position: { ...positionRef.current } });
      }
    };

    const wheelDesktop = throttle(wheelFunc, ZOOM_DESKTOP_THROTTLE_DURATION);
    const wheelMobile = throttle(wheelFunc, ZOOM_NON_DESKTOP_THROTTLE_DURATION);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      wheelDesktop(e);
    };

    const onWheelMobile = (e: TouchEvent) => {
      if (!isEventMobileZoom(e)) return;
      wheelMobile(touchEventToZoom(e));
    };

    if (isMobile) {
      containerNode.addEventListener('touchmove', onWheelMobile);
      containerNode.addEventListener('touchup', resetTouchEvent);
      containerNode.addEventListener('touchend', resetTouchEvent);
      containerNode.addEventListener('touchcancel', resetTouchEvent);
    } else {
      containerNode.addEventListener('wheel', onWheel);
    }

    return () => {
      if (isMobile) {
        containerNode.removeEventListener('touchmove', onWheelMobile);
        containerNode.removeEventListener('touchup', resetTouchEvent);
        containerNode.removeEventListener('touchend', resetTouchEvent);
        containerNode.removeEventListener('touchcancel', resetTouchEvent);
        wheelMobile.cancel();
      } else {
        containerNode.removeEventListener('wheel', onWheel);
        wheelDesktop.cancel();
      }
    };
  }, dependencies);

  return zoomRef;
};

export default useZoom;
