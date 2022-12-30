import { ClientPosition, Elements, ElementsInMove, ElementsContext } from 'types'
import { createExternalContext, useRef, useState } from '@/helpers/effects'

const elementsContext = createExternalContext<ElementsContext>()

export const useElements = (): ElementsContext => elementsContext.current

export const withElementsProvider = (cb: () => void) => {
  const [elementsInMove, setElementsInMove] = useState<ElementsInMove>(null);
  const elementsRef: Elements = useRef({});
  const lastElementMouseMoveEventRef = useRef<ClientPosition>();

  elementsContext.current = {
    elementsInMove,
    elementsRef,
    lastElementMouseMoveEventRef,
    setElementsInMove,
  }

  cb()

  elementsContext.current = null
}
