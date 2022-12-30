import { Position } from 'types';
import getBoundingClientRect from '@/helpers/getBoundingClientRect';
import getScrollOffset from '@/helpers/getScrollOffset';
import positionFromEvent from '@/helpers/positionFromEvent';
import produceElementPosition from '@/helpers/produceElementPosition';
import { usePanZoom } from '@/panZoomProvider';

type useElementMouseDownPositionThunk = (
  e: MouseEvent | TouchEvent,
  elementNode: HTMLDivElement,
) => Position;

export const useElementMouseDownPosition = (): useElementMouseDownPositionThunk => {
  const { childNode, containerNode, zoomRef } = usePanZoom();

  return (e, elementNode) => {
    const eventPosition = positionFromEvent(e);
    const parent = getBoundingClientRect(containerNode);
    const rect = getBoundingClientRect(elementNode);
    const scroll = getScrollOffset(childNode);

    return {
      x: (eventPosition.clientX - rect.left + parent.left + scroll.x) / zoomRef.current,
      y: (eventPosition.clientY - rect.top + parent.top + scroll.y) / zoomRef.current,
    };
  };
};

type UseElementMouseMovePosition = (
  e: MouseEvent | TouchEvent,
  from: Position,
  elementNode: HTMLDivElement,
) => Position;

export const useElementMouseMovePosition = (): UseElementMouseMovePosition => {
  const { childNode, positionRef, zoomRef } = usePanZoom();
  return (e, from, elementNode) => {
    const eventPosition = positionFromEvent(e);
    const scroll = getScrollOffset(childNode);

    return produceElementPosition({
      element: elementNode,
      container: childNode, // TODO
      x: (eventPosition.clientX - positionRef.current.x + scroll.x) / zoomRef.current - from.x,
      y: (eventPosition.clientY - positionRef.current.y + scroll.y) / zoomRef.current - from.y,
      zoom: zoomRef.current,
    });
  };
};
