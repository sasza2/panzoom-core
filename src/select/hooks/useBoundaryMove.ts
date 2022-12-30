import { useEffect } from '@/helpers/effects'
import { onMouseDown, onMouseUp, onMouseMove } from '@/helpers/eventListener';
import {
  useElementMouseDownPosition,
  useElementMouseMovePosition,
} from '@/hooks/useElementEventPosition';
import { MoveRef, useSelect } from '../createProvider';

type UseBoundaryMove = ({ grabElementsRef }: { grabElementsRef: MoveRef }) => void;

const useBoundaryMove: UseBoundaryMove = ({ grabElementsRef }) => {
  const {
    boundary, setBoundary, movingRef, selectRef, move, setMove,
  } = useSelect();
  const mouseDownPosition = useElementMouseDownPosition();
  const mouseMovePosition = useElementMouseMovePosition();

  useEffect(() => {
    if (!boundary) return undefined;

    const mousedownOnSelectArea = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      setBoundary(null);
    };

    const mousedownOnMovingArea = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const position = mouseDownPosition(e, selectRef.current);
      const nextMove = {
        x: position.x - boundary.left,
        y: position.y - boundary.top,
      };
      setMove(nextMove);
    };

    const selectMouseDownClear = onMouseDown(selectRef.current, mousedownOnSelectArea);
    const movingMouseDownClear = onMouseDown(movingRef.current, mousedownOnMovingArea);

    return () => {
      selectMouseDownClear();
      movingMouseDownClear();
    };
  }, [boundary]);

  useEffect(() => {
    if (!move) return undefined;

    const mousemove = (e: MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const position = mouseMovePosition(e, move, movingRef.current);
      movingRef.current.style.transform = `translate(${position.x}px, ${position.y}px)`;
      grabElementsRef.current(position);
    };

    const mouseup = () => {
      setMove(null);
      setBoundary(null);
    };

    const mouseMoveClear = onMouseMove(mousemove);
    const mouseUpClear = onMouseUp(window, mouseup);

    return () => {
      mouseMoveClear();
      mouseUpClear();
    };
  }, [boundary, move]);
};

export default useBoundaryMove;
