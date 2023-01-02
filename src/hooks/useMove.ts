import { Position } from 'types';
import { useEffect } from '@/helpers/effects';
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

  const containerMouseDownPosition = useContainerMouseDownPosition();

  useEffect(() => {
    const grabbingClassName = `${className}--grabbing`;
    let mouseMoveClear: ReturnType<typeof onMouseMove> = null;
    let moving: Position = null;

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

    const mousedown = (e: MouseEvent) => {
      if (e.button) return;

      const position = containerMouseDownPosition(e);
      const stop = stopEventPropagation();

      document.body.style.userSelect = 'none';
      document.body.classList.add(grabbingClassName);

      if (onContainerClickRef.current) {
        onContainerClickRef.current({
          e,
          x: position.x / zoomRef.current,
          y: position.y / zoomRef.current,
          stop,
        });
      }

      if (disabled || disabledMove || stop.done) return;

      moving = position;
      mouseMoveClear = onMouseMove(move);
    };

    const mouseup = () => {
      document.body.style.userSelect = null;
      document.body.classList.remove(grabbingClassName);
      if (mouseMoveClear) {
        mouseMoveClear();
        mouseMoveClear = null;
      }
    };

    const mouseDownClear = onMouseDown(containerNode, mousedown);
    const mouseUpClear = onMouseUp(containerNode, mouseup);

    return () => {
      mouseDownClear();
      mouseUpClear();
      if (mouseMoveClear) mouseMoveClear();
    };
  }, [boundary, disabled, disabledMove]);
};

export default useMove;
