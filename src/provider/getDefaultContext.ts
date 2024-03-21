import { API, PanZoomContext, PanZoomOptions } from 'types';
import { createRef } from '@/helpers/effects';
import {
  SCROLL_SPEED_DEFAULT,
  ZOOM_INITIAL,
  ZOOM_MIN_DEFAULT,
  ZOOM_MAX_DEFAULT,
  ZOOM_SPEED_DEFAULT,
} from '@/consts';

const getDefaultContext = (childNode: HTMLDivElement, options: PanZoomOptions): PanZoomContext => {
  const containerNode = childNode.parentNode as HTMLDivElement;

  return {
    apiRef: createRef<API>(null),
    blockMovingRef: createRef(false),
    boundary: options.boundary,
    childNode,
    className: options.className || 'panzoom-core',
    containerNode,
    disabled: options.disabled || false,
    disabledElements: options.disabledElements || false,
    disabledScrollHorizontal: options.disabledScrollHorizontal === undefined
      ? true
      : options.disabledScrollHorizontal,
    disabledScrollVertical: options.disabledScrollVertical === undefined
      ? true
      : options.disabledScrollVertical,
    disabledUserSelect: options.disabledUserSelect || false,
    disabledZoom: options.disabledZoom || false,
    disabledMove: options.disabledMove || false,
    elementsAutoMoveAtEdge: options.elementsAutoMoveAtEdge === undefined
      ? true
      : options.elementsAutoMoveAtEdge,
    onContextMenuRef: createRef(options.onContextMenu),
    onContainerChangeRef: createRef(options.onContainerChange),
    onContainerClickRef: createRef(options.onContainerClick),
    onContainerPositionChangeRef: createRef(options.onContainerPositionChange),
    onContainerZoomChangeRef: createRef(options.onContainerZoomChange),
    onElementsChangeRef: createRef(options.onElementsChange),
    positionRef: createRef({ x: 0, y: 0 }),
    selecting: options.selecting || false,
    scrollSpeed: options.scrollSpeed || SCROLL_SPEED_DEFAULT,
    width: options.width || '100%',
    height: options.height || '100%',
    zoomRef: createRef(options.zoomInitial || ZOOM_INITIAL),
    zoomInitial: options.zoomInitial || ZOOM_INITIAL,
    zoomMin: options.zoomMin || ZOOM_MIN_DEFAULT,
    zoomMax: options.zoomMax || ZOOM_MAX_DEFAULT,
    zoomPosition: options.zoomPosition,
    zoomSpeed: options.zoomSpeed || ZOOM_SPEED_DEFAULT,
  };
};

export default getDefaultContext;
