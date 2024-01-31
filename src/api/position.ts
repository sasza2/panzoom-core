import {
  BoundaryProp, Position, Ref, Zoom,
} from 'types';
import getBoundingClientRect from '@/helpers/getBoundingClientRect';
import positionClone from '@/helpers/positionClone';
import produceStyle from '@/helpers/produceStyle';
import produceBounding from '@/helpers/produceBounding';

type GetPosition = (props: { positionRef: Ref<Position> }) => () => Position;

export const getPosition: GetPosition = ({ positionRef }) => () => positionClone(positionRef);

type SetPosition = (props: {
  boundary?: BoundaryProp;
  childNode: HTMLDivElement;
  containerNode: HTMLDivElement;
  positionRef: Ref<Position>;
  zoomRef: Zoom;
}) => (x: number, y: number) => void;

export const setPosition: SetPosition = ({
  boundary,
  childNode,
  containerNode,
  positionRef,
  zoomRef,
}) => (x, y) => {
  const parentSize = getBoundingClientRect(containerNode);

  const nextPosition = produceBounding({
    boundary,
    x,
    y,
    parentSize,
    childSize: getBoundingClientRect(childNode),
  });

  const position = positionRef;
  position.current = nextPosition;

  childNode.style.transform = produceStyle({
    position: positionRef.current,
    zoom: zoomRef.current,
  });
};
