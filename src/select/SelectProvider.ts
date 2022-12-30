import { Position, Ref } from 'types'
import { createRef, useRef, useState } from '@/helpers/effects'

export type MoveRef = Ref<(position: Position) => void>;

export type Boundary = {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
};

type SelectContext = {
  boundary: Boundary;
  setBoundary: (boundary: Boundary) => void;
  expandingRef: Ref<HTMLDivElement>;
  movingRef: Ref<HTMLDivElement>;
  selectRef: Ref<HTMLDivElement>;
  move: Position | null;
  setMove: (position: Position | null) => void;
}

const selectContext = createRef<SelectContext>(null)

export const useSelect = (): SelectContext => selectContext.current

export const SelectProvider = () => {
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
  }
}

export default SelectProvider
