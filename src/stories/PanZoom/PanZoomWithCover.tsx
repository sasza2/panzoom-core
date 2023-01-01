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

type PanZoomWithCoverOmit = Omit<PanZoomOptions, 'boundary'>

const omitFields = ['boundary']
const panZoomWithCoverAllowedProps = getAllowedPanZoomProps()
  .filter(propName => !omitFields.includes(propName)) as Array<keyof PanZoomWithCoverOmit>

type PanZoomWithCoverProps = {
  apiRef?: MutableRefObject<API>,
  cover: string,
  onCoverLoad?: () => void,
} & PanZoomWithCoverOmit

const PanZoomWithCover: React.FC<PanZoomWithCoverProps> = ({
  apiRef,
  children,
  cover,
  onCoverLoad,
  ...props
}) => {
  const childRef = useRef<HTMLDivElement>()
  const parentRef = useRef<HTMLDivElement>()
  const panZoomRef = useRef<PanZoomApi>(null)
  const [initialized, setInitialized] = useState(false)

  const deps = panZoomWithCoverAllowedProps.map(propName => props[propName])

  useLayoutEffect(() => {
    setInitialized(false)

    const image = new Image();
    image.src = cover;
    image.onload = () => {
      const containerNode = parentRef.current.parentNode as HTMLElement;
      const containerSize = containerNode.getBoundingClientRect()

      const imageSize = {
        width: image.naturalWidth,
        height: image.naturalHeight,
      };

      const scale = Math.max(
        containerSize.width / imageSize.width,
        containerSize.height / imageSize.height,
      );

      childRef.current.style.backgroundImage = `url('${cover}')`;

      panZoomRef.current = initPanZoom(
        childRef.current,
        {
          ...props,
          boundary: true,
          className: props.className || 'react-panzoom-with-cover',
          width: imageSize.width,
          height: imageSize.height,
          zoomInitial: scale,
          zoomMin: scale,
          zoomMax: props.zoomMax * scale,
        },
      )

      setInitialized(true)
      onCoverLoad()
    };

    return () => {
      if (!panZoomRef.current) return
      panZoomRef.current.destroy()
      panZoomRef.current = null
    }
  }, [cover])

  useDidUpdateEffect(() => {
    if (panZoomRef.current) panZoomRef.current.setOptions(props)
  }, deps)

  useImperativeHandle(
    apiRef,
    () => panZoomRef.current,
  )

  return (
    <ElementsContext.Provider value={{ initialized, panZoomRef }}>
      <div ref={parentRef}>
        <div ref={childRef}>
          {children}
        </div>
      </div>
    </ElementsContext.Provider>
  )
}

const PanZoomWithCoverRef = forwardRef((props: PanZoomWithCoverProps, ref: MutableRefObject<API>) => (
  <PanZoomWithCover {...props} apiRef={ref} />
)) as React.FC<PanZoomWithCoverProps & { ref?: MutableRefObject<API> }>

export default PanZoomWithCoverRef
