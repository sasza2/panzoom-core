import React, { useContext, useLayoutEffect, useRef } from 'react';

import { ElementApi, ElementOptions } from 'types'
import ElementsContext from './ElementsContext'
import useDidUpdateEffect from './useDidUpdateEffect'

const Element: React.FC<ElementOptions> = ({
  children, className, disabled, id, onClick, x, y,
}) => {
  const nodeRef = useRef<HTMLDivElement>()
  const elementRef = useRef<ElementApi>()
  const { initialized, panZoomRef } = useContext(ElementsContext)

  const options = {
    className: className || 'react-panzoom-element',
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

export default Element
