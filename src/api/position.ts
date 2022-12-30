import { Position, Ref, Zoom } from 'types';
import positionClone from '@/helpers/positionClone';
import produceStyle from '@/helpers/produceStyle';

type GetPosition = (props: { positionRef: Ref<Position> }) => () => Position;

export const getPosition: GetPosition = ({ positionRef }) => () => positionClone(positionRef);

type SetPosition = (props: {
  childNode: HTMLDivElement;
  positionRef: Ref<Position>;
  zoomRef: Zoom;
}) => (x: number, y: number) => void;

export const setPosition: SetPosition = ({ childNode, positionRef, zoomRef }) => (x, y) => {
  const position = positionRef;
  position.current = { x, y };
  childNode.style.transform = produceStyle({
    position: positionRef.current,
    zoom: zoomRef.current,
  });
};
