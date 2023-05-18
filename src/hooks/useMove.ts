import { Position } from 'types';
import bodyClassList from '@/helpers/bodyClassList';
import { useEffect, useState } from '@/helpers/effects';
import { onMouseDown, onMouseUp, onMouseMove } from '@/helpers/eventListener';
import getBoundingClientRect from '@/helpers/getBoundingClientRect';
import positionFromEvent from '@/helpers/positionFromEvent';
import produceBounding from '@/helpers/produceBounding';
import produceStyle from '@/helpers/produceStyle';
import stopEventPropagation from '@/helpers/stopEventPropagation';
import { usePanZoom } from '@/provider';
import useContainerMouseDownPosition from './useContainerMouseDownPosition';

const useMove = () => {
  const {
    blockMovingRef,
    boundary,
    childNode,
    containerNode,
    className,
    disabled,
    disabledMove,
    onContainerChangeRef,
    onContainerClickRef,
    onContainerPositionChangeRef,
    positionRef,
    zoomRef,
  } = usePanZoom();

  const [moving, setMoving] = useState<Position | null>(null);
  const containerMouseDownPosition = useContainerMouseDownPosition();
  const grabbingClassName = `${className}--grabbing`;

  useEffect(() => {
    const mousedown = (e: MouseEvent) => {
      if (e.button) return;

      const position = containerMouseDownPosition(e);
      const stop = stopEventPropagation();

      document.body.style.userSelect = 'none';
      bodyClassList.add(grabbingClassName);

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

    const mouseDownClear = onMouseDown(containerNode, mousedown);
    return mouseDownClear;
  }, [boundary, disabled, disabledMove]);

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

    const mouseup = () => {
      document.body.style.userSelect = null;
      bodyClassList.remove(grabbingClassName);
      setMoving(null);
    };

    const mouseUpClear = onMouseUp(containerNode, mouseup);
    const mouseMoveClear = onMouseMove(move);

    return () => {
      mouseUpClear();
      mouseMoveClear();
    };
  }, [moving]);
};

export default useMove;
