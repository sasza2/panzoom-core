import { Position, Ref } from 'types';
import { createRef } from '@/helpers/effects';

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

export const selectContext = createRef<SelectContext>(null);

const useSelect = (): SelectContext => selectContext.current;

export default useSelect;
