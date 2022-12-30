import React, { createContext, DependencyList, EffectCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ElementApi, ElementOptions, PanZoomApi, PanZoomOptions } from 'types'
import initPanZoom, { getAllowedPanZoomProps } from '../';

const useDidUpdateEffect = (cb: EffectCallback, deps: DependencyList) => {
  const didMount = useRef(false)

  useEffect(() => {
    if (!didMount.current) {
      didMount.current = true
      return
    }
    return cb()
  }, deps)
}

type ElementsContextValue = {
  initialized: boolean,
  panZoomRef: React.MutableRefObject<PanZoomApi>
}

const ElementsContext = createContext({} as ElementsContextValue)

export const Element: React.FC<ElementOptions> = ({
  children, disabled, id, onClick, x, y,
}) => {
  const nodeRef = useRef<HTMLDivElement>()
  const elementRef = useRef<ElementApi>()
  const { initialized, panZoomRef } = useContext(ElementsContext)

  const options = {
    id,
    disabled,
    onClick,
    x,
    y,
  }

  useLayoutEffect(() => {
    if (!initialized) return

    elementRef.current = panZoomRef.current.addElement(nodeRef.current, options)
    return elementRef.current.destroy
  }, [initialized])

  useDidUpdateEffect(() => {
    elementRef.current.setOptions(options)
  }, [disabled, id, onClick, x, y])

  return (
    <div ref={nodeRef}>{children}</div>
  )
}

const panZoomAllowedProps = getAllowedPanZoomProps()

const PanZoom: React.FC<PanZoomOptions> = ({
  children,
  ...props
}) => {
  const childRef = useRef()
  const panZoomRef = useRef<PanZoomApi>(null)
  const [initialized, setInitialized] = useState(false)

  const deps = panZoomAllowedProps.map(propName => props[propName])

  useLayoutEffect(() => {
    panZoomRef.current = initPanZoom(childRef.current, props);
    setInitialized(true)
    return panZoomRef.current.destroy
  }, [])

  useDidUpdateEffect(() => {
    panZoomRef.current.setOptions(props)
  }, deps)

  return (
    <ElementsContext.Provider value={{ initialized, panZoomRef }}>
      <div>
        <div ref={childRef}>
          {children}
        </div>
      </div>
    </ElementsContext.Provider>
  )
}

export default PanZoom
