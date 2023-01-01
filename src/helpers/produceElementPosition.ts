import { Position } from 'types';

import getBoundingClientRect from './getBoundingClientRect';

type ProduceElementPositionProps = {
  element: HTMLElement;
  childNode: HTMLDivElement;
  x: number;
  y: number;
  zoom: number;
};

const produceElementPosition = ({
  element,
  childNode,
  x,
  y,
  zoom,
}: ProduceElementPositionProps): Position => {
  const elementRect = getBoundingClientRect(element);
  const childRect = getBoundingClientRect(childNode);

  const maxRight = (childRect.width - elementRect.width) / zoom;
  const maxBottom = (childRect.height - elementRect.height) / zoom;

  const position: Position = { x, y };

  if (position.x < 0) position.x = 0;
  else if (position.x > maxRight) position.x = maxRight;

  if (position.y < 0) position.y = 0;
  else if (position.y > maxBottom) position.y = maxBottom;

  return position;
};

export default produceElementPosition;
