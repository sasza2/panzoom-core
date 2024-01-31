import { Position, Ref } from 'types';
import { useContext } from '@/helpers/effects';

export const SELECT_CONTEXT_ID = 'select';

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

const useSelect = () => useContext<SelectContext>(SELECT_CONTEXT_ID);

export default useSelect;
