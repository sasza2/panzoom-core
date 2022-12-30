import { Position } from 'types';
import getBoundingClientRect from '@/helpers/getBoundingClientRect';
import positionFromEvent from '@/helpers/positionFromEvent';
import { usePanZoom } from '@/provider'

const useContainerMouseDownPosition = (): ((
  e: MouseEvent | TouchEvent
) => Position) => {
  const { containerNode, positionRef } = usePanZoom();

  return (e: MouseEvent | TouchEvent): Position => {
    const eventPosition = positionFromEvent(e);
    const rect = getBoundingClientRect(containerNode);

    return {
      x: eventPosition.clientX - rect.left - (positionRef.current.x || 0),
      y: eventPosition.clientY - rect.top - (positionRef.current.y || 0),
    };
  };
};

export default useContainerMouseDownPosition;
