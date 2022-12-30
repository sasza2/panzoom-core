import { PanZoomContext } from 'types'
import produceStyle from './produceStyle';

const produceStyleByContext = (context: PanZoomContext): string =>
  produceStyle({ position: context.positionRef.current, zoom: context.zoomRef.current })

export default produceStyleByContext
