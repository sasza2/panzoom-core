import { Position } from 'types';
import actionsClassList from '@/helpers/actionsClassList';
import clearStyleAttribute from '@/helpers/clearStyleAttribute';
import { useEffect } from '@/helpers/effects';
import {
  onMouseDown,
  onMouseUp,
  onMouseMove,
  onContextMenu as onContextMenuListener,
} from '@/helpers/eventListener';
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
    onContextMenuRef,
    onContainerChangeRef,
    onContainerClickRef,
    onContainerPositionChangeRef,
    positionRef,
    zoomRef,
  } = usePanZoom();

  const containerMouseDownPosition = useContainerMouseDownPosition();
  const grabbingClassName = `${className}--grabbing`;

  useEffect(() => {
    let moving: Position | null = null;

    let mouseUpClear: ReturnType<typeof onMouseUp> | null = null;
    let mouseMoveClear: ReturnType<typeof onMouseMove> | null = null;

    const clearStyles = () => {
      document.body.style.userSelect = null;
      clearStyleAttribute(document.body);
      actionsClassList.remove(childNode, grabbingClassName);
      moving = null;
    };

    const clearMouseUpEvents = () => {
      if (mouseUpClear) {
        mouseUpClear();
        mouseUpClear = null;
      }
      if (mouseMoveClear) {
        mouseMoveClear();
        mouseMoveClear = null;
      }
    };

    const mouseup = () => {
      clearStyles();
      clearMouseUpEvents();
    };

    const move = (e: MouseEvent) => {
      if (blockMovingRef.current) return;

      if (!moving || e.buttons === 0) {
        mouseup();
        return;
      }

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

      if (onContainerClickRef.current) {
        onContainerClickRef.current({
          e,
          x: position.x / zoomRef.current,
          y: position.y / zoomRef.current,
          stop,
        });
      }

      if (disabled || disabledMove || stop.done) return;

      document.body.style.userSelect = 'none';
      actionsClassList.add(childNode, grabbingClassName);

      moving = position;

      clearMouseUpEvents();

      mouseUpClear = onMouseUp(containerNode, mouseup);
      mouseMoveClear = onMouseMove(move);
    };

    const contextmenu = (e: MouseEvent) => {
      if (!onContextMenuRef.current) return;

      const position = containerMouseDownPosition(e);

      onContextMenuRef.current({
        e,
        x: position.x / zoomRef.current,
        y: position.y / zoomRef.current,
      });
    };

    const mouseDownClear = onMouseDown(containerNode, mousedown);
    const onContextMenuClear = onContextMenuListener(containerNode, contextmenu);

    return () => {
      clearStyles();
      clearMouseUpEvents();
      mouseDownClear();
      onContextMenuClear();
    };
  }, [boundary, disabled, disabledMove]);
};

export default useMove;
