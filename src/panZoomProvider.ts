import { PanZoomContext, PanZoomOptions } from 'types'
import applyStyles from '@/helpers/applyStyles'
import { createExternalContext, createRef, useEffect } from '@/helpers/effects'
import produceStyleByContext from '@/helpers/produceStyleByContext'
import removeStyles from '@/helpers/removeStyles'
import valueToCSSAttribute from '@/helpers/valueToCSSAttribute'
import { CHILD_DISABLED_STYLE, CHILD_STYLE, CONTAINER_STYLE } from './styles'
import {
  CLASS_NAME,
  ZOOM_INITIAL,
  ZOOM_MIN_DEFAULT,
  ZOOM_MAX_DEFAULT,
  ZOOM_SPEED_DEFAULT, } from './consts';

const panZoomContext = createExternalContext<PanZoomContext>()

export const usePanZoom = (): PanZoomContext => panZoomContext.current

export const createPanZoomProvider = (childNode: HTMLDivElement, options: PanZoomOptions): [(cb: (() => void)) => void, () => PanZoomContext] => {
  const containerNode = childNode.parentNode as HTMLDivElement

  const panZoomContextValue: PanZoomContext = {
    blockMovingRef: createRef(false),
    boundary: options.boundary,
    childNode,
    className: options.className,
    containerNode,
    disabled: options.disabled || false,
    disabledElements: options.disabledElements || false,
    disabledUserSelect: options.disabledUserSelect || false,
    disabledZoom: options.disabledZoom || false,
    disabledMove: false,
    onContainerChangeRef: createRef(options.onContainerChange),
    onContainerClickRef: createRef(options.onContainerClick),
    onContainerPositionChangeRef: createRef(options.onContainerChange),
    onContainerZoomChangeRef: createRef(options.onContainerZoomChange),
    onElementsChangeRef: createRef(options.onElementsChange),
    positionRef: createRef({ x: 0, y: 0 }),
    selecting: options.selecting || false,
    width: options.width || '100%',
    height: options.height || '100%',
    zoomRef: createRef(1), // TODO
    zoomInitial: options.zoomInitial || ZOOM_INITIAL,
    zoomMin: options.zoomMin || ZOOM_MIN_DEFAULT,
    zoomMax: options.zoomMax || ZOOM_MAX_DEFAULT,
    zoomSpeed: options.zoomSpeed || ZOOM_SPEED_DEFAULT,
  }

  const getPanZoomContext = () => panZoomContextValue

  const run = (cb: () => void) => {
    panZoomContext.current = panZoomContextValue

    useEffect(() => {
      const childStyle = {
        ...CHILD_STYLE,
        height: valueToCSSAttribute(panZoomContextValue.width),
        width: valueToCSSAttribute(panZoomContextValue.height),
        transform: produceStyleByContext(panZoomContextValue),
      }

      applyStyles(childNode, childStyle)

      return () => {
        removeStyles(childNode, childStyle)
      }
    }, [panZoomContextValue.width, panZoomContextValue.height])

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
      if (!panZoomContextValue.selecting) return

      childNode.style.pointerEvents = 'all';

      return () => {
        childNode.style.pointerEvents = null;
      }
    }, [panZoomContextValue.selecting])

    useEffect(() => {
      if (!panZoomContextValue.className) return

      const classNameIn = `${panZoomContextValue.className}__in`
      childNode.classList.add(classNameIn)
      containerNode.classList.add(panZoomContextValue.className)

      return () => {
        childNode.classList.remove(classNameIn)
        containerNode.classList.remove(panZoomContextValue.className)
      }
    }, [panZoomContextValue.className])

    useEffect(() => {
      if (!panZoomContextValue.className || !panZoomContextValue.selecting) return

      const className = `${panZoomContextValue.className}--selecting`
      containerNode.classList.add(className)

      return () => {
        containerNode.classList.remove(className)
      }
    }, [panZoomContextValue.className, panZoomContextValue.selecting])

    useEffect(() => {
      if (!panZoomContextValue.disabledUserSelect) return

      const className = `${CLASS_NAME}--disabled-user-select`
      containerNode.classList.add(className);
      applyStyles(childNode, CHILD_DISABLED_STYLE)

      return () => {
        containerNode.classList.remove(className);
        removeStyles(childNode, CHILD_DISABLED_STYLE)
      }
    }, [panZoomContextValue.disabledUserSelect])

    cb()
    panZoomContext.current = null
  }

  return [run, getPanZoomContext]
}