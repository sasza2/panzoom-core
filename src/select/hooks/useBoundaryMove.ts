import { useEffect } from '@/helpers/effects';
import { onMouseDown, onMouseUp, onMouseMove } from '@/helpers/eventListener';
import getWindow from '@/helpers/getWindow';
import {
  useElementMouseDownPosition,
  useElementMouseMovePosition,
} from '@/hooks/useElementEventPosition';
import useGrabElements from './useGrabElements';
import useSelect from './useSelect';

type UseBoundaryMove = () => void;

const useBoundaryMove: UseBoundaryMove = () => {
  const grabElementsRef = useGrabElements();

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
    const mouseUpClear = onMouseUp(getWindow(), mouseup);

    return () => {
      mouseMoveClear();
      mouseUpClear();
    };
  }, [boundary, move]);
};

export default useBoundaryMove;
