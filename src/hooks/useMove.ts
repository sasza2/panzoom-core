import { Position } from 'types';
import { GRABBING_CLASS_NAME } from '@/styles';
import { useEffect, useState } from '@/helpers/effects';
import { onMouseDown, onMouseUp, onMouseMove } from '@/helpers/eventListener';
import getBoundingClientRect from '@/helpers/getBoundingClientRect';
import positionFromEvent from '@/helpers/positionFromEvent';
import produceBounding from '@/helpers/produceBounding';
import produceStyle from '@/helpers/produceStyle';
import stopEventPropagation from '@/helpers/stopEventPropagation';
import useContainerMouseDownPosition from './useContainerMouseDownPosition';
import { usePanZoom } from '@/panZoomProvider'

const useMove = () => {
  const [moving, setMoving] = useState<Position | null>(null);
  const {
    blockMovingRef,
    boundary,
    childNode,
    containerNode,
    disabled,
    disabledMove,
    onContainerChangeRef,
    onContainerClickRef,
    onContainerPositionChangeRef,
    positionRef,
    zoomRef,
  } = usePanZoom()

  const containerMouseDownPosition = useContainerMouseDownPosition();

  // Handle mousedown + mouseup
  useEffect(() => {
    const mousedown = (e: MouseEvent) => {
      if (e.button) return;

      const position = containerMouseDownPosition(e);
      const stop = stopEventPropagation();

      document.body.style.userSelect = 'none';
      document.body.classList.add(GRABBING_CLASS_NAME);

      if (onContainerClickRef.current) {
        onContainerClickRef.current({
          e,
          x: position.x / zoomRef.current,
          y: position.y / zoomRef.current,
          stop,
        });
      }
      if (disabled || disabledMove || stop.done) return;

      setMoving(position);
    };

    const mouseup = () => {
      document.body.style.userSelect = null;
      document.body.classList.remove(GRABBING_CLASS_NAME);
      setMoving(null);
    };

    const mouseDownClear = onMouseDown(containerNode, mousedown);
    const mouseUpClear = onMouseUp(containerNode, mouseup);

    return () => {
      mouseDownClear();
      mouseUpClear();
    };
  }, [disabled, disabledMove]);

  // Handle mousemove
  useEffect(() => {
    if (!moving) return undefined;

    const move = (e: MouseEvent) => {
      if (blockMovingRef.current) return;

      childNode.style.transition = null;

      const parentRect = getBoundingClientRect(containerNode);
      const eventPosition = positionFromEvent(e);
      const nextPosition = produceBounding({
        boundary,
        x: eventPosition.clientX - parentRect.left - moving.x,
        y: eventPosition.clientY - parentRect.top - moving.y,
        parentSize: parentRect,
        childSize: getBoundingClientRect(childNode),
      });

      positionRef.current = nextPosition;
      childNode.style.transform = produceStyle({
        position: positionRef.current,
        zoom: zoomRef.current,
      });

      const eventValue = {
        position: { ...positionRef.current },
        zoom: zoomRef.current,
      };

      if (onContainerChangeRef.current) onContainerChangeRef.current(eventValue);
      if (onContainerPositionChangeRef.current) onContainerPositionChangeRef.current(eventValue);
    };

    const mouseMoveClear = onMouseMove(move);
    return mouseMoveClear;
  }, [boundary, moving]);
};

export default useMove;
