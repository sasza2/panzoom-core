import {
  ClientPosition, Elements, ElementsContext, ElementsInMove,
} from 'types';
import { useContext, useProvider, useRef } from '@/helpers/effects';

const ELEMENTS_CONTEXT_ID = 'elements';

export const useElements = () => useContext<ElementsContext>(ELEMENTS_CONTEXT_ID);

const ElementsProvider = () => {
  const elementsRef: Elements = useRef({});
  const elementsInMoveRef: ElementsInMove = useRef(null);
  const lastElementMouseMoveEventRef = useRef<ClientPosition>();

  useProvider(ELEMENTS_CONTEXT_ID, {
    elementsRef,
    elementsInMoveRef,
    lastElementMouseMoveEventRef,
  });
};

export default ElementsProvider;
