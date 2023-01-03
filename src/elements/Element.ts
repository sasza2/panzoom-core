import { ElementsInMove, ElementOptions } from 'types';
import { ELEMENT_CLASS_NAME } from '@/consts';
import { ELEMENT_STYLE } from '@/styles';
import { useEffect, useRef } from '@/helpers/effects';
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
import useElementAutoMoveAtEdge from '@/hooks/useElementAutoMoveAtEdge';
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

  const mouseDownPosition = useElementMouseDownPosition();
  const mouseMovePosition = useElementMouseMovePosition();
  const startAutoMove = useElementAutoMoveAtEdge();

  const {
    blockMovingRef, boundary, disabledElements, onElementsChangeRef,
  } = usePanZoom();

  const {
    elementsRef,
    lastElementMouseMoveEventRef,
  } = useElements();

  const onClickRef = useRef<typeof onClick>();
  onClickRef.current = onClick;

  const onMouseUpRef = useRef<typeof onMouseUp>();
  onMouseUpRef.current = onMouseUp;

  useEffect(() => () => {
    elementNode.style.transform = null;
    elementNode.style.zIndex = null;
    delete elementsRef.current[id as string];
  }, []);

  useEffect(() => {
    const position = { x, y };

    elementNode.style.transform = produceStyle({ position });
    elementsRef.current[id as string] = {
      family,
      id,
      node: { current: elementNode },
      position,
    };
  }, [id, x, y]);

  useEffect(() => {
    const element = elementsRef.current[id as string];
    if (element) element.family = family;
  }, [family]);

  useEffect(() => {
    if (disabled || disabledElements) return undefined;

    let mouseUpClear: ReturnType<typeof onMouseUpListener> = null;
    let mouseMoveClear: ReturnType<typeof onMouseMove> = null;
    let stopElementsAutoMove: () => void = null;
    let elementsInMove: ElementsInMove = {};

    const clearElementsAutoMove = () => {
      if (!stopElementsAutoMove) return;
      stopElementsAutoMove();
      stopElementsAutoMove = null;
    };

    const increaseZIndex = () => {
      lastZIndex += 1;
      elementNode.style.zIndex = lastZIndex.toString();
    };

    const mousemove = (e: MouseEvent) => {
      if (blockMovingRef.current) {
        clearElementsAutoMove();
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

    const mouseup = (e: MouseEvent) => {
      clearElementsAutoMove();

      if (onMouseUpRef.current) {
        onMouseUpRef.current({
          id,
          family,
          e,
          ...elementsRef.current[id as string].position,
        });
      }

      if (mouseUpClear) {
        mouseUpClear();
        mouseUpClear = null;
      }
      if (mouseMoveClear) {
        mouseMoveClear();
        mouseMoveClear = null;
      }
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

      elementsInMove = elements.reduce((curr, element) => {
        curr[element.id] = mouseDownPosition(e, element.node.current);
        return curr;
      }, {} as ElementsInMove);

      stopElementsAutoMove = startAutoMove(elementsInMove);

      mouseUpClear = onMouseUpListener(elementNode, mouseup);
      mouseMoveClear = onMouseMove(mousemove);
      increaseZIndex();
    };

    const mouseDownClear = onMouseDown(elementNode, mousedown);
    return () => {
      clearElementsAutoMove();
      mouseDownClear();
      if (mouseUpClear) mouseUpClear();
      if (mouseMoveClear) mouseMoveClear();
    };
  }, [
    disabled,
    disabledElements,
    draggableSelector,
    family,
    JSON.stringify(followers),
    JSON.stringify(boundary),
    id,
  ]);

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
