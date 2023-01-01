import {
  ClientPosition, Elements, ElementsInMove, ElementsContext,
} from 'types';
import { createRef, useRef, useState } from '@/helpers/effects';

export const elementsContext = createRef<ElementsContext>(null);

const ElementsProvider = () => {
  const [elementsInMove, setElementsInMove] = useState<ElementsInMove>(null);
  const elementsRef: Elements = useRef({});
  const lastElementMouseMoveEventRef = useRef<ClientPosition>();

  elementsContext.current = {
    elementsInMove,
    elementsRef,
    lastElementMouseMoveEventRef,
    setElementsInMove,
  };
};

export default ElementsProvider;
