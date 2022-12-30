import { Position, Ref, Zoom } from 'types';
import positionClone from '@/helpers/positionClone';
import produceStyle from '@/helpers/produceStyle';

type Move = (props: {
  childNode: HTMLDivElement;
  positionRef: Ref<Position>;
  zoomRef: Zoom;
}) => (x: number, y: number) => Position;

const move: Move = ({ childNode, positionRef, zoomRef }) => (x, y) => {
  const position = positionRef;

  if (position.current) {
    position.current = {
      x: positionRef.current.x + x,
      y: positionRef.current.y + y,
    };
  } else {
    position.current = { x, y };
  }

  childNode.style.transform = produceStyle({
    position: positionRef.current,
    zoom: zoomRef.current,
  });

  return positionClone(positionRef);
};

export default move;
