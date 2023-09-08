import { ElementsInMove, ElementOptions } from 'types';
import { ELEMENT_CLASS_NAME } from '@/consts';
import { ELEMENT_STYLE } from '@/styles';
import bodyClassList from '@/helpers/bodyClassList';
import { useEffect, useRef, useState } from '@/helpers/effects';
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
import setNextZIndex from '@/helpers/setNextZIndex';
import useElementAutoMoveAtEdge from '@/hooks/useElementAutoMoveAtEdge';
import useElementResize from '@/hooks/useElementResize';
import { useElements } from '@/elements';
import { usePanZoom } from '@/provider';

const Element = (elementNode: HTMLDivElement) => ({
  id,
  className = ELEMENT_CLASS_NAME,
  disabled,
  draggableSelector,
  followers = [],
  x = 0,
  y = 0,
  family,
  height,
  onAfterResize,
  onStartResizing,
  onClick,
  onMouseUp,
  resizable,
  resizerWidth,
  resizedMaxWidth,
  resizedMinWidth,
  width,
}: ElementOptions) => {
  if (!id) throw new Error("'id' prop for element can't be undefined");

  const mouseDownPosition = useElementMouseDownPosition();
  const mouseMovePosition = useElementMouseMovePosition();
  const startAutoMove = useElementAutoMoveAtEdge();
  const [elementsInMove, setElementsInMove] = useState<ElementsInMove>(null);
  const { elementsInMoveRef } = useElements();

  const updateElementsInMove = (nextElementsInMove: ElementsInMove) => {
    setElementsInMove(nextElementsInMove);
    elementsInMoveRef.current = nextElementsInMove;
  };

  useElementResize(elementNode, {
    className,
    disabled,
    id,
    onAfterResize,
    onStartResizing,
    resizable,
    resizerWidth,
    resizedMaxWidth,
    resizedMinWidth,
  });

  const {
    blockMovingRef,
    boundary,
    className: containerClassName,
    disabledElements,
    elementsAutoMoveAtEdge,
    onElementsChangeRef,
  } = usePanZoom();

  const movingClassName = `${containerClassName}--element-moving`;

  const {
    elementsRef,
    elementsUpdatePositionApiRef,
    lastElementMouseMoveEventRef,
  } = useElements();

  const onClickRef = useRef<typeof onClick>();
  onClickRef.current = onClick;

  const onMouseUpRef = useRef<typeof onMouseUp>();
  onMouseUpRef.current = onMouseUp;

  useEffect(() => {
    elementsUpdatePositionApiRef.current[id] = updateElementsInMove;

    return () => {
      elementNode.style.transform = null;
      elementNode.style.zIndex = null;
      delete elementsRef.current[id as string];
      delete elementsUpdatePositionApiRef.current[id];
    };
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

    const mousedown = (e: MouseEvent) => {
      if (e.button) return;
      if (draggableSelector && !(e.target as HTMLElement).closest(draggableSelector)) return;

      bodyClassList.add(movingClassName);

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

      updateElementsInMove(elements.reduce((curr, element) => {
        curr[element.id] = mouseDownPosition(e, element.node.current);
        return curr;
      }, {} as ElementsInMove));

      setNextZIndex(elementNode);
    };

    const mouseDownClear = onMouseDown(elementNode, mousedown);
    return mouseDownClear;
  }, [
    disabled,
    disabledElements,
    draggableSelector,
    family,
    JSON.stringify(followers),
    JSON.stringify(boundary),
    id,
    movingClassName,
  ]);

  useEffect(() => {
    if (!elementsInMove) return undefined;

    let stopElementsAutoMove: ReturnType<typeof startAutoMove> = null;
    if (elementsAutoMoveAtEdge) {
      stopElementsAutoMove = startAutoMove(elementsInMove);
    }

    const mousemove = (e: MouseEvent) => {
      if (blockMovingRef.current || e.buttons === 0) {
        updateElementsInMove(null);
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
      if (onMouseUpRef.current) {
        onMouseUpRef.current({
          id,
          family,
          e,
          ...elementsRef.current[id as string].position,
        });
      }

      updateElementsInMove(null);
      bodyClassList.remove(movingClassName);
    };

    const mouseUpClear = onMouseUpListener(elementNode, mouseup);
    const mouseMoveClear = onMouseMove(mousemove);

    return () => {
      if (stopElementsAutoMove) stopElementsAutoMove();
      mouseUpClear();
      mouseMoveClear();
      bodyClassList.remove(movingClassName);
    };
  }, [elementsAutoMoveAtEdge, elementsInMove]);

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

  useEffect(() => {
    elementNode.style.width = width === undefined ? null : `${width}px`;
  }, [width]);

  useEffect(() => {
    elementNode.style.height = height === undefined ? null : `${height}px`;
  }, [height]);
};

export default Element;
