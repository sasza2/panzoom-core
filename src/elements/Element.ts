import { ElementsInMove, ElementOptions } from 'types';
import { ELEMENT_CLASS_NAME } from '@/consts';
import { ELEMENT_STYLE } from '@/styles';
import { useEffect, useState, useRef } from '@/helpers/effects';
import { onMouseDown, onMouseUp as onMouseUpListener, onMouseMove } from '@/helpers/eventListener';
import positionFromEvent from '@/helpers/positionFromEvent';
import produceStyle from '@/helpers/produceStyle';
import stopEventPropagation from '@/helpers/stopEventPropagation';
import updateFamilyOfElementsPosition from '@/helpers/updateFamilyOfElementsPosition';
import {
  useElementMouseDownPosition,
  useElementMouseMovePosition,
} from '@/hooks/useElementEventPosition';
import applyClassName from '@/helpers/applyClassName';
import applyStyles from '@/helpers/applyStyles';
import { useElements } from '@/elements';
import { usePanZoom } from '@/provider';

let lastZIndex = 2;

const Element = (elementNode: HTMLDivElement) => ({
  id,
  className = ELEMENT_CLASS_NAME,
  disabled,
  draggableSelector,
  followers = [],
  x = 0,
  y = 0,
  family,
  onClick,
  onMouseUp,
}: ElementOptions) => {
  if (!id) throw new Error("'id' prop for element can't be undefined");

  const [isMoved, setIsMoved] = useState<boolean>(false);

  const mouseDownPosition = useElementMouseDownPosition();
  const mouseMovePosition = useElementMouseMovePosition();

  const {
    blockMovingRef, boundary, disabledElements, onElementsChangeRef,
  } = usePanZoom();

  const {
    elementsInMove,
    elementsRef,
    lastElementMouseMoveEventRef,
    setElementsInMove,
  } = useElements();

  const onClickRef = useRef<typeof onClick>();
  onClickRef.current = onClick;

  const onMouseUpRef = useRef<typeof onMouseUp>();
  onMouseUpRef.current = onMouseUp;

  const onElementsAction = (nextElementsInMove: ElementsInMove) => {
    setElementsInMove(nextElementsInMove);
    setIsMoved(!!nextElementsInMove);
  };

  useEffect(() => {
    const position = { x, y };

    elementNode.style.transform = produceStyle({ position });
    elementsRef.current[id as string] = {
      family,
      id,
      node: { current: elementNode },
      position,
    };

    return () => {
      delete elementsRef.current[id as string];
    };
  }, [id, x, y]);

  useEffect(() => {
    if (disabledElements || !isMoved) return undefined;

    const mouseup = (e: MouseEvent) => {
      onElementsAction(null);

      if (onMouseUpRef.current) {
        onMouseUpRef.current({
          id,
          family,
          e,
          ...elementsRef.current[id as string].position,
        });
      }
    };

    const mouseUpClear = onMouseUpListener(elementNode, mouseup);

    return () => {
      mouseUpClear();
    };
  }, [disabledElements, id, isMoved]);

  useEffect(() => {
    if (disabledElements || !elementsInMove || !isMoved) return undefined;

    const mousemove = (e: MouseEvent) => {
      if (blockMovingRef.current) {
        onElementsAction(null);
        return;
      }

      lastElementMouseMoveEventRef.current = positionFromEvent(e);

      updateFamilyOfElementsPosition({
        elementsRef,
        elementsInMove,
        produceNextPosition: (from, currentElement) => {
          const position = mouseMovePosition(e, from, currentElement.node.current);
          return position;
        },
        onElementsChange: onElementsChangeRef.current,
      });
    };

    const mouseMoveClear = onMouseMove(mousemove);

    return () => {
      mouseMoveClear();
      if (isMoved) setElementsInMove(null);
    };
  }, [JSON.stringify(boundary), disabledElements, elementsInMove, id, isMoved]);

  useEffect(() => {
    if (disabled) return undefined;

    const increaseZIndex = () => {
      lastZIndex += 1;
      elementNode.style.zIndex = lastZIndex.toString();
    };

    const mousedown = (e: MouseEvent) => {
      if (e.button) return;
      if (draggableSelector && !(e.target as HTMLElement).closest(draggableSelector)) return;

      const elements = Object.values(elementsRef.current).filter(
        (element) => element.id === id
          || (family && element.family === family)
          || followers.includes(element.id),
      );

      const position = mouseDownPosition(e, elementNode);
      const stop = stopEventPropagation();

      if (onClickRef.current) {
        onClickRef.current({
          id,
          family,
          e,
          stop,
          ...position,
        });
      }

      e.preventDefault();
      e.stopPropagation();

      if (stop.done) return;

      onElementsAction(
        elements.reduce((curr, element) => {
          curr[element.id] = mouseDownPosition(e, element.node.current);
          return curr;
        }, {} as ElementsInMove),
      );

      increaseZIndex();
    };

    const mouseDownClear = onMouseDown(elementNode, mousedown);
    return mouseDownClear;
  }, [disabled, family, JSON.stringify(followers), id]);

  useEffect(
    () => applyStyles(elementNode, ELEMENT_STYLE),
    [],
  );

  useEffect(
    () => applyClassName(elementNode, `${className} ${className}--id-${id}`),
    [className, id],
  );

  useEffect(() => {
    if (!disabled) return undefined;
    return applyClassName(elementNode, `${className}--disabled`);
  }, [className, disabled]);
};

export default Element;
