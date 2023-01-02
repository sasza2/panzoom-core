import {
  ClientPosition, Elements, ElementsContext,
} from 'types';
import { createRef, useRef } from '@/helpers/effects';

export const elementsContext = createRef<ElementsContext>(null);

const ElementsProvider = () => {
  const elementsRef: Elements = useRef({});
  const lastElementMouseMoveEventRef = useRef<ClientPosition>();

  elementsContext.current = {
    elementsRef,
    lastElementMouseMoveEventRef,
  };
};

export default ElementsProvider;
