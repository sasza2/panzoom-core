import { Position, Ref, Zoom } from 'types';
import { distanceToRightEdge, distanceToBottomEdge } from './isEdgeVisible';
import moveScroll from './moveScroll';
import produceStyle from './produceStyle';

type AppendToCurrentPositionProps = {
  childNode: HTMLDivElement,
  positionRef: Ref<Position>;
  addPosition: Position;
  zoomRef: Zoom;
};

const appendToCurrentPosition = ({
  childNode,
  positionRef,
  addPosition,
  zoomRef,
}: AppendToCurrentPositionProps): void => {
  const toAdd = moveScroll(childNode, addPosition.x, addPosition.y);

  positionRef.current = {
    x: positionRef.current.x + toAdd.x,
    y: positionRef.current.y + toAdd.y,
  };

  if (toAdd.y < 0) {
    const diffY = distanceToBottomEdge(childNode);
    if (diffY < -toAdd.y) positionRef.current.y += -toAdd.y - diffY;
  } else if (toAdd.y > 0) {
    if (positionRef.current.y > 0) positionRef.current.y = 0;
  }

  if (toAdd.x < 0) {
    const diffX = distanceToRightEdge(childNode);
    if (diffX < -toAdd.x) positionRef.current.x += -toAdd.x - diffX;
  } else if (toAdd.x > 0) {
    if (positionRef.current.x > 0) positionRef.current.x = 0;
  }

  childNode.style.transform = produceStyle({
    position: positionRef.current,
    zoom: zoomRef.current,
  });
};

export default appendToCurrentPosition;
