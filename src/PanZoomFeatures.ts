import useElementAutoMoveAtEdge from './hooks/useElementAutoMoveAtEdge'
import useMove from './hooks/useMove'
import useZoom from './hooks/useZoom'

const PanZoomFeatures = () => {
  useMove()
  useZoom()
  useElementAutoMoveAtEdge()
}

export default PanZoomFeatures
