import { Position } from 'types';
import loopParentNodes from './loopParentNodes';

const getScrollOffset = (childNode: HTMLDivElement): Position => {
  const parent: HTMLDivElement = childNode.parentNode as HTMLDivElement;

  const scroll = {
    x: 0,
    y: 0,
  };

  loopParentNodes(parent.parentNode as HTMLDivElement)
    .forEachToWindow((node) => {
      scroll.x += node.scrollLeft || 0;
      scroll.y += node.scrollTop || 0;
    });

  return scroll;
};

export default getScrollOffset;
