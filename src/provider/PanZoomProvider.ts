import { PanZoomContext } from 'types'
import { createRef } from '@/helpers/effects'

export const panZoomContext = createRef<PanZoomContext>(null)

const PanZoomProvider = (props: PanZoomContext) => {
  panZoomContext.current = props
}

export default PanZoomProvider
