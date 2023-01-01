import { PanZoomOptions } from 'types';

const getAllowedProps = (): Array<keyof PanZoomOptions> => [
  'boundary',
  'className',
  'disabled',
  'disabledElements',
  'disabledMove',
  'disabledUserSelect',
  'disabledZoom',
  'onElementsChange',
  'onContainerChange',
  'onContainerClick',
  'onContainerPositionChange',
  'onContainerZoomChange',
  'selecting',
  'width',
  'height',
  'zoomInitial',
  'zoomMax',
  'zoomMin',
  'zoomSpeed',
];

export default getAllowedProps;
