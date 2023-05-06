import {
  Boundary, Edge, Element, Elements,
} from 'types';

type ElementsInBoundary = Record<string, Element>;

const edgeToNumber = (edge: Edge): number => {
  if (typeof edge === 'string') return parseInt(edge, 10);
  return edge;
};

const collectElements = (boundary: Boundary, elements: Elements['current']): ElementsInBoundary => {
  const elementsInBoundary: ElementsInBoundary = {};

  Object.entries(elements).forEach(([id, element]) => {
    if (
      element.position.x >= edgeToNumber(boundary.left)
      && element.position.x <= edgeToNumber(boundary.right)
      && element.position.y >= edgeToNumber(boundary.top)
      && element.position.y <= edgeToNumber(boundary.bottom)
    ) {
      elementsInBoundary[id] = element;
    }
  });

  return elementsInBoundary;
};

export default collectElements;
