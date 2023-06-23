import {
  Elements, OnElementsChange, Position, Ref,
} from 'types';
import produceStyle from '@/helpers/produceStyle';

type GetElements = ({ elementsRef }: { elementsRef: Elements }) => () => Elements['current'];

export const getElements: GetElements = ({ elementsRef }) => () => elementsRef.current;

type UpdateElementPosition = ({
  elementsRef,
  onElementsChangeRef,
}: {
  elementsRef: Elements;
  onElementsChangeRef: Ref<OnElementsChange>,
}) => (id: string | number, position: Position) => void;

const update = ({
  id,
  elementsRef,
  position,
}: {
  id: string | number,
  elementsRef: Elements,
  position: Position,
}) => {
  const element = elementsRef.current[id as string];
  if (!element) return;

  element.node.current.style.transform = produceStyle({ position });
  element.position = position;
};

export const updateElementPosition: UpdateElementPosition = ({
  elementsRef,
  onElementsChangeRef,
}) => (id, position) => {
  update({
    id,
    elementsRef,
    position,
  });

  if (onElementsChangeRef.current) {
    onElementsChangeRef.current({
      [id]: position,
    });
  }
};

export const updateElementPositionSilent: UpdateElementPosition = ({
  elementsRef,
}) => (id, position) => {
  update({
    id,
    elementsRef,
    position,
  });
};
