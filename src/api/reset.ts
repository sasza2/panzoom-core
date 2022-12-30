import { Position, Ref, Zoom } from 'types';
import produceStyle from '@/helpers/produceStyle';

type Reset = (props: {
  childNode: HTMLDivElement;
  positionRef: Ref<Position>;
  zoomRef: Zoom;
}) => () => void;

const reset: Reset = ({ childNode, positionRef, zoomRef }) => () => {
  const zoom = zoomRef;
  const position = positionRef;
  zoom.current = 1;
  position.current = { x: 0, y: 0 };
  childNode.style.transform = produceStyle({
    position: positionRef.current,
    zoom: zoomRef.current,
  });
};

export default reset;
