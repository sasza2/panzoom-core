import { ElementsInMove } from 'types';
import { ELEMENT_AUTO_MOVE_SPEED, ELEMENT_AUTO_MOVE_STEP } from '@/consts';
import appendToCurrentPosition from '@/helpers/appendToCurrentPosition';
import isCursorOnEdge from '@/helpers/isCursorOnEdge';
import isEdgeVisible from '@/helpers/isEdgeVisible';
import produceElementPosition from '@/helpers/produceElementPosition';
import updateFamilyOfElementsPosition from '@/helpers/updateFamilyOfElementsPosition';
import { useElements } from '@/elements';
import { usePanZoom } from '@/provider';

type UseElementAutoMoveAtEdge = () => (elementsInMove: ElementsInMove) => () => void;

const useElementAutoMoveAtEdge: UseElementAutoMoveAtEdge = () => {
  const {
    childNode,
    onElementsChangeRef,
    positionRef,
    zoomRef,
  } = usePanZoom();

  const { elementsRef, lastElementMouseMoveEventRef } = useElements();

  return (elementsInMove: ElementsInMove) => {
    const timer = setInterval(() => {
      if (!lastElementMouseMoveEventRef.current) return;
      if (!childNode) return;

      const addPosition = {
        x: 0,
        y: 0,
      };

      const cursorOnEdge = isCursorOnEdge(childNode, lastElementMouseMoveEventRef.current);
      if (cursorOnEdge.left && !isEdgeVisible.left(childNode, positionRef)) {
        addPosition.x = ELEMENT_AUTO_MOVE_STEP;
      } else if (cursorOnEdge.right && !isEdgeVisible.right(childNode, positionRef)) {
        addPosition.x = -ELEMENT_AUTO_MOVE_STEP;
      }

      if (cursorOnEdge.top && !isEdgeVisible.top(childNode, positionRef)) {
        addPosition.y = ELEMENT_AUTO_MOVE_STEP;
      } else if (cursorOnEdge.bottom && !isEdgeVisible.bottom(childNode, positionRef)) {
        addPosition.y = -ELEMENT_AUTO_MOVE_STEP;
      }

      if (!addPosition.x && !addPosition.y) return;

      appendToCurrentPosition({
        childNode,
        positionRef,
        addPosition,
        zoomRef,
      });

      updateFamilyOfElementsPosition({
        elementsRef,
        elementsInMove,
        produceNextPosition: (from, currentElement) => produceElementPosition({
          elementNode: currentElement.node.current,
          childNode,
          x: currentElement.position.x - addPosition.x / zoomRef.current,
          y: currentElement.position.y - addPosition.y / zoomRef.current,
          zoom: zoomRef.current,
        }),
        onElementsChange: onElementsChangeRef.current,
      });
    }, ELEMENT_AUTO_MOVE_SPEED);

    return () => {
      clearInterval(timer);
      lastElementMouseMoveEventRef.current = null;
    };
  };
};

export default useElementAutoMoveAtEdge;
