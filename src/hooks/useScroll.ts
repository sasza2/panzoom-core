import { SCROLL_WHEEL_DELAY } from '@/consts';
import { useElements } from '@/elements';
import { useEffect } from '@/helpers/effects';
import getBoundingClientRect from '@/helpers/getBoundingClientRect';
import produceBounding from '@/helpers/produceBounding';
import produceElementPosition from '@/helpers/produceElementPosition';
import produceStyle from '@/helpers/produceStyle';
import updateFamilyOfElementsPosition from '@/helpers/updateFamilyOfElementsPosition';
import { usePanZoom } from '@/provider';

const useScroll = () => {
  const {
    boundary,
    childNode,
    containerNode,
    disabledScrollHorizontal,
    disabledScrollVertical,
    onElementsChangeRef,
    positionRef,
    scrollSpeed,
    zoomRef,
  } = usePanZoom();

  const { elementsRef, elementsInMoveRef } = useElements();

  useEffect(() => {
    if (disabledScrollHorizontal && disabledScrollVertical) return undefined;

    const parentSize = getBoundingClientRect(containerNode);
    let prevTime = 0;

    const onWheel = (e: WheelEvent) => {
      const currentTime = new Date().getTime();
      if (currentTime - prevTime < SCROLL_WHEEL_DELAY) return;
      prevTime = currentTime;

      const zoom = zoomRef.current;
      const position = positionRef.current;

      const addX = disabledScrollHorizontal ? 0 : scrollSpeed;
      const addY = disabledScrollVertical ? 0 : scrollSpeed;
      const scrollUp = e.deltaY > 0;

      const nextPosition = produceBounding({
        boundary,
        x: scrollUp ? position.x - addX : position.x + addX,
        y: scrollUp ? position.y - addY : position.y + addY,
        parentSize,
        childSize: getBoundingClientRect(childNode),
      });

      positionRef.current = nextPosition;
      childNode.style.transform = produceStyle({
        position: nextPosition,
        zoom: zoomRef.current,
      });

      const diff = {
        x: scrollUp ? position.x - nextPosition.x : nextPosition.x - position.x,
        y: scrollUp ? position.y - nextPosition.y : nextPosition.y - position.y,
      };

      const elementsInMove = elementsInMoveRef.current;
      if (!elementsInMove) return;

      updateFamilyOfElementsPosition({
        elementsRef,
        elementsInMove,
        produceNextPosition: (from, currentElement) => produceElementPosition({
          elementNode: currentElement.node.current,
          childNode,
          x: currentElement.position.x + (scrollUp ? diff.x : -diff.x) / zoom,
          y: currentElement.position.y + (scrollUp ? diff.y : -diff.y) / zoom,
          zoom: zoomRef.current,
        }),
        onElementsChange: onElementsChangeRef.current,
      });
    };

    containerNode.addEventListener('wheel', onWheel);

    return () => {
      containerNode.removeEventListener('wheel', onWheel);
    };
  }, [JSON.stringify(boundary), disabledScrollHorizontal, disabledScrollVertical, scrollSpeed]);
};

export default useScroll;
