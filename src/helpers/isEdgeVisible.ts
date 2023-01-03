import { Position, Ref } from 'types';
import getBoundingClientRect from './getBoundingClientRect';
import getParentVisibleSize from './getParentVisibleSize';
import getScrollOffset from './getScrollOffset';

export const distanceToRightEdge = (
  childNode: HTMLDivElement,
): number => {
  const [width] = getParentVisibleSize(childNode);
  const childRect = getBoundingClientRect(childNode);
  const parentRect = getBoundingClientRect(childNode.parentNode as HTMLDivElement);
  const marginLeft = Math.max(parentRect.left, 0);

  return childRect.right - width - marginLeft;
};

const isEdgeRightVisible = (
  childNode: HTMLDivElement,
  positionRef: Ref<Position>,
): boolean => {
  const childRect = getBoundingClientRect(childNode);
  const parentRect = getBoundingClientRect(childNode.parentNode as HTMLDivElement);

  const positionX = positionRef.current.x + childRect.width;

  return (
    positionX + parentRect.left > 0
    && positionX >= 0
    && distanceToRightEdge(childNode) <= 0
  );
};

export const distanceToBottomEdge = (
  childNode: HTMLDivElement,
): number => {
  const [, height] = getParentVisibleSize(childNode);
  const childRect = getBoundingClientRect(childNode);
  const parentRect = getBoundingClientRect(childNode.parentNode as HTMLDivElement);
  const marginTop = Math.max(parentRect.top, 0);

  return childRect.bottom - height - marginTop;
};

const isEdgeBottomVisible = (
  childNode: HTMLDivElement,
  positionRef: Ref<Position>,
): boolean => {
  const childRect = getBoundingClientRect(childNode);
  const parentRect = getBoundingClientRect(childNode.parentNode as HTMLDivElement);

  const positionY = positionRef.current.y + childRect.height;

  return (
    positionY + parentRect.top > 0
    && positionY >= 0
    && distanceToBottomEdge(childNode) <= 0
  );
};

const isEdgeLeftVisible = (
  childNode: HTMLDivElement,
  positionRef: Ref<Position>,
): boolean => {
  const scroll = getScrollOffset(childNode);
  const parentRect = getBoundingClientRect(childNode.parentNode as HTMLDivElement);
  const [visibleWidth] = getParentVisibleSize(childNode);

  return (
    positionRef.current.x + parentRect.left >= 0
    && positionRef.current.x >= 0
    && positionRef.current.x < visibleWidth + scroll.x
  );
};

const isEdgeTopVisible = (
  childNode: HTMLDivElement,
  positionRef: Ref<Position>,
): boolean => {
  const scroll = getScrollOffset(childNode);
  const parentRect = getBoundingClientRect(childNode.parentNode as HTMLDivElement);
  const [, visibleHeight] = getParentVisibleSize(childNode);

  return (
    positionRef.current.y + parentRect.top >= 0
    && positionRef.current.y >= 0
    && positionRef.current.y < visibleHeight + scroll.y
  );
};

export default {
  left: isEdgeLeftVisible,
  right: isEdgeRightVisible,
  top: isEdgeTopVisible,
  bottom: isEdgeBottomVisible,
};
