import { PanZoomOptions } from 'types';

const getAllowedProps = (): Array<keyof PanZoomOptions> => [
  'boundary',
  'className',
  'disabled',
  'disabledElements',
  'disabledMove',
  'disabledScrollHorizontal',
  'disabledScrollVertical',
  'disabledUserSelect',
  'disabledZoom',
  'elementsAutoMoveAtEdge',
  'onElementsChange',
  'onContextMenu',
  'onContainerChange',
  'onContainerClick',
  'onContainerPositionChange',
  'onContainerZoomChange',
  'selecting',
  'scrollSpeed',
  'width',
  'height',
  'zoomInitial',
  'zoomMax',
  'zoomMin',
  'zoomSpeed',
];

export default getAllowedProps;
