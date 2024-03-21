import { Position, ZoomEvent, ZoomPosition } from 'types';

type GetZoomPositionInParentRect = (props: {
  e: ZoomEvent,
  parentRect: DOMRect,
  zoomPosition?: ZoomPosition,
}) => Position

export const getZoomPositionInParentRect: GetZoomPositionInParentRect = ({
  e, parentRect, zoomPosition,
}): Position => {
  const position: Position = {
    x: e.clientX - parentRect.left,
    y: e.clientY - parentRect.top,
  };

  if (!zoomPosition) return position;

  if (zoomPosition.x === 'center') {
    position.x = parentRect.width / 2;
  } else if (zoomPosition.x !== undefined) {
    position.x = zoomPosition.x;
  }

  if (zoomPosition.y === 'center') {
    position.y = parentRect.height / 2;
  } else if (zoomPosition.y !== undefined) {
    position.y = zoomPosition.y;
  }

  return position;
};
