import { Position, Ref } from 'types';

const positionClone = (positionRef: Ref<Position>): Position => ({
  ...positionRef.current,
});

export default positionClone;
