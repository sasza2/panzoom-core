import { PanZoomContext } from 'types';
import { panZoomContext } from './PanZoomProvider';

const usePanZoom = (): PanZoomContext => panZoomContext.current;

export default usePanZoom;
