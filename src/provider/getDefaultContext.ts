import { API, PanZoomContext, PanZoomOptions } from 'types';
import { createRef } from '@/helpers/effects';
import {
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
    className: options.className,
    containerNode,
    disabled: options.disabled || false,
    disabledElements: options.disabledElements || false,
    disabledUserSelect: options.disabledUserSelect || false,
    disabledZoom: options.disabledZoom || false,
    disabledMove: false,
    onContainerChangeRef: createRef(options.onContainerChange),
    onContainerClickRef: createRef(options.onContainerClick),
    onContainerPositionChangeRef: createRef(options.onContainerPositionChange),
    onContainerZoomChangeRef: createRef(options.onContainerZoomChange),
    onElementsChangeRef: createRef(options.onElementsChange),
    positionRef: createRef({ x: 0, y: 0 }),
    selecting: options.selecting || false,
    width: options.width || '100%',
    height: options.height || '100%',
    zoomRef: createRef(options.zoomInitial || ZOOM_INITIAL),
    zoomInitial: options.zoomInitial || ZOOM_INITIAL,
    zoomMin: options.zoomMin || ZOOM_MIN_DEFAULT,
    zoomMax: options.zoomMax || ZOOM_MAX_DEFAULT,
    zoomSpeed: options.zoomSpeed || ZOOM_SPEED_DEFAULT,
  };
};

export default getDefaultContext;
