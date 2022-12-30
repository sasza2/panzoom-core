import { CLASS_NAME } from './consts'
import { CHILD_DISABLED_STYLE, CHILD_STYLE, CONTAINER_STYLE } from './styles'
import applyStyles from '@/helpers/applyStyles'
import removeStyles from '@/helpers/removeStyles'
import produceStyle from '@/helpers/produceStyle'
import { useEffect } from '@/helpers/effects'
import valueToCSSAttribute from '@/helpers/valueToCSSAttribute'
import useApi from './hooks/useApi'
import useElementAutoMoveAtEdge from './hooks/useElementAutoMoveAtEdge'
import useMove from './hooks/useMove'
import useZoom from './hooks/useZoom'

import { usePanZoom } from '@/provider'

const PanZoom = () => {
  const {
    childNode,
    className,
    containerNode,
    disabledUserSelect,
    height,
    positionRef,
    selecting,
    width,
    zoomRef,
  } = usePanZoom()

  useMove()
  useZoom()
  useElementAutoMoveAtEdge()
  useApi()

  useEffect(() => {
    const childStyle = {
      ...CHILD_STYLE,
      height: valueToCSSAttribute(width),
      width: valueToCSSAttribute(height),
      transform: produceStyle({
        position: positionRef.current,
        zoom: zoomRef.current,
      }),
    }

    applyStyles(childNode, childStyle)

    return () => {
      removeStyles(childNode, childStyle)
    }
  }, [width, height])

  useEffect(() => {
    childNode.setAttribute('draggable', 'false')
    childNode.classList.add(`${CLASS_NAME}__in`)

    containerNode.classList.add(CLASS_NAME)

    applyStyles(containerNode, CONTAINER_STYLE)

    return () => {
      childNode.setAttribute('draggable', null)
      childNode.classList.remove(`${CLASS_NAME}__in`)

      containerNode.classList.remove(CLASS_NAME)

      removeStyles(containerNode, CONTAINER_STYLE)
    }
  }, [])

  useEffect(() => {
    if (!selecting) return

    childNode.style.pointerEvents = 'all';

    return () => {
      childNode.style.pointerEvents = null;
    }
  }, [selecting])

  useEffect(() => {
    if (!className) return

    const classNameIn = `${className}__in`
    childNode.classList.add(classNameIn)
    containerNode.classList.add(className)

    return () => {
      childNode.classList.remove(classNameIn)
      containerNode.classList.remove(className)
    }
  }, [className])

  useEffect(() => {
    if (!className || !selecting) return

    const classNameSelecting = `${className}--selecting`
    containerNode.classList.add(classNameSelecting)

    return () => {
      containerNode.classList.remove(classNameSelecting)
    }
  }, [className, selecting])

  useEffect(() => {
    if (!disabledUserSelect) return

    const classNameDisabled = `${CLASS_NAME}--disabled-user-select`
    containerNode.classList.add(classNameDisabled);
    applyStyles(childNode, CHILD_DISABLED_STYLE)

    return () => {
      containerNode.classList.remove(classNameDisabled);
      removeStyles(childNode, CHILD_DISABLED_STYLE)
    }
  }, [disabledUserSelect])
}

export default PanZoom
