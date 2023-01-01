import React, {
  forwardRef,
  MutableRefObject,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState
} from 'react';

import { API, PanZoomApi, PanZoomOptions } from 'types'
import initPanZoom, { getAllowedPanZoomProps } from '@/index';
import ElementsContext from './ElementsContext'
import useDidUpdateEffect from './useDidUpdateEffect'

const panZoomAllowedProps = getAllowedPanZoomProps()

const PanZoom: React.FC<PanZoomOptions & { apiRef?: MutableRefObject<API> }> = ({
  apiRef,
  children,
  ...props
}) => {
  const childRef = useRef<HTMLDivElement>()
  const panZoomRef = useRef<PanZoomApi>(null)
  const [initialized, setInitialized] = useState(false)

  const deps = panZoomAllowedProps.map(propName => props[propName])

  useLayoutEffect(() => {
    panZoomRef.current = initPanZoom(childRef.current, {
      ...props,
      className: props.className || 'react-panzoom',
    });
    setInitialized(true)
    return panZoomRef.current.destroy
  }, [])

  useDidUpdateEffect(() => {
    if (panZoomRef.current) panZoomRef.current.setOptions(props)
  }, deps)

  useImperativeHandle(
    apiRef,
    () => panZoomRef.current,
  )

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

const PanZoomRef = forwardRef((props: PanZoomOptions, ref: MutableRefObject<API>) => (
  <PanZoom {...props} apiRef={ref} />
)) as React.FC<PanZoomOptions & { ref?: MutableRefObject<API> }>

export default PanZoomRef
