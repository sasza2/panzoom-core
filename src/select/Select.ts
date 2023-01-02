import { Position } from 'types';
import { usePanZoom } from '@/provider';
import { SELECT_STYLE, SELECT_BOX_STYLE } from '@/styles';
import { useEffect, useRef, useState } from '@/helpers/effects';
import applyStyles from '@/helpers/applyStyles';
import valueToCSSAttribute from '@/helpers/valueToCSSAttribute';
import useBoundary from './hooks/useBoundary';
import useBoundaryMove from './hooks/useBoundaryMove';
import { Boundary, selectContext } from './hooks/useSelect';

const Select = () => {
  const { childNode, selecting } = usePanZoom();
  const expandingRef = useRef<HTMLDivElement>();
  const movingRef = useRef<HTMLDivElement>();
  const selectRef = useRef<HTMLDivElement>();
  const [boundary, setBoundary] = useState<Boundary | null>(null);
  const [move, setMove] = useState<Position | null>(null);

  selectContext.current = {
    boundary,
    setBoundary,
    expandingRef,
    movingRef,
    selectRef,
    move,
    setMove,
  };

  useEffect(() => {
    selectRef.current = document.createElement('div');
    applyStyles(selectRef.current, SELECT_STYLE);

    expandingRef.current = document.createElement('div');
    applyStyles(expandingRef.current, SELECT_BOX_STYLE);

    movingRef.current = document.createElement('div');
  }, []);

  const { expanding } = useBoundary();

  useEffect(() => {
    if (!selecting) return undefined;

    childNode.appendChild(selectRef.current);

    return () => {
      childNode.removeChild(selectRef.current);
    };
  }, [selecting]);

  useEffect(() => {
    if (!boundary) return undefined;

    const boundaryStyle = {
      ...SELECT_BOX_STYLE,
      transform: `translate(${boundary.left}px, ${boundary.top}px)`,
      width: valueToCSSAttribute(boundary.width),
      height: valueToCSSAttribute(boundary.height),
    };

    const removeStyles = applyStyles(movingRef.current, boundaryStyle);
    selectRef.current.appendChild(movingRef.current);

    return () => {
      removeStyles();
      selectRef.current.removeChild(movingRef.current);
    };
  }, [boundary]);

  useEffect(() => {
    if (!(expanding && !boundary)) return undefined;

    selectRef.current.appendChild(expandingRef.current);

    return () => {
      selectRef.current.removeChild(expandingRef.current);
    };
  }, [expanding && !boundary]);

  useBoundaryMove();
};

export default Select;
