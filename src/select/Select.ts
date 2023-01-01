import { usePanZoom } from '@/provider'
import { SELECT_STYLE, SELECT_BOX_STYLE } from '@/styles';
import { useEffect } from '@/helpers/effects'
import applyStyles from '@/helpers/applyStyles'
import valueToCSSAttribute from '@/helpers/valueToCSSAttribute';
import useBoundary from './hooks/useBoundary';
import useBoundaryMove from './hooks/useBoundaryMove';
import useGrabElements from './hooks/useGrabElements';
import { useSelect } from './SelectProvider';

const Select = () => {
  const { childNode, selecting } = usePanZoom()
  const { selectRef, expandingRef, movingRef } = useSelect();

  useEffect(() => {
    selectRef.current = document.createElement('div')
    applyStyles(selectRef.current, SELECT_STYLE)

    expandingRef.current = document.createElement('div')
    applyStyles(expandingRef.current, SELECT_BOX_STYLE)

    movingRef.current = document.createElement('div')
  }, [])

  useEffect(() => {
    if (!selecting) return

    childNode.appendChild(selectRef.current)

    return () => {
      childNode.removeChild(selectRef.current)
    }
  }, [selecting])

  const { boundary, expanding } = useBoundary();

  useEffect(() => {
    if (!boundary) return

    const boundaryStyle = {
      ...SELECT_BOX_STYLE,
      transform: `translate(${boundary.left}px, ${boundary.top}px)`,
      width: valueToCSSAttribute(boundary.width),
      height: valueToCSSAttribute(boundary.height),
    };

    const removeStyles = applyStyles(movingRef.current, boundaryStyle)
    selectRef.current.appendChild(movingRef.current)

    return () => {
      removeStyles()
      selectRef.current.removeChild(movingRef.current)
    }
  }, [boundary])

  useEffect(() => {
    if (!(expanding && !boundary)) return

    selectRef.current.appendChild(expandingRef.current)

    return () => {
      selectRef.current.removeChild(expandingRef.current)
    }
  }, [expanding && !boundary])

  const grabElementsRef = useGrabElements();
  useBoundaryMove({ grabElementsRef });
}

export default Select
