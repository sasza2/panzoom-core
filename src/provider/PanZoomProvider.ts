import { PanZoomContext } from 'types';
import { useContext, useProvider } from '@/helpers/effects';

const PANZOOM_CONTEXT_ID = 'panzoom';

export const usePanZoom = () => useContext<PanZoomContext>(PANZOOM_CONTEXT_ID);

const PanZoomProvider = (props: PanZoomContext) => {
  useProvider(PANZOOM_CONTEXT_ID, props);
};

export default PanZoomProvider;
