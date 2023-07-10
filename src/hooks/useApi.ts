import { API } from 'types';
import { usePanZoom } from '@/provider';
import { useElements } from '@/elements';
import { getElements, updateElementPosition, updateElementPositionSilent } from '@/api/elements';
import move from '@/api/move';
import { getPosition, setPosition } from '@/api/position';
import reset from '@/api/reset';
import {
  getZoom, setZoom, zoomIn, zoomOut,
} from '@/api/zoom';
import useEventsCallback from './useEventsCallback';

const useApi = (): void => {
  const {
    apiRef,
    boundary,
    childNode,
    containerNode,
    onElementsChangeRef,
    positionRef,
    zoomMax,
    zoomMin,
    zoomRef,
  } = usePanZoom();

  const { elementsRef, elementsInMoveRef } = useElements();

  const { withEventAll, withEventPosition, withEventZoom } = useEventsCallback();

  apiRef.current = {
    childNode,
    move: withEventPosition(
      move({
        childNode,
        positionRef,
        zoomRef,
      }),
    ),
    getElements: getElements({ elementsRef }),
    getElementsInMove: () => elementsInMoveRef.current || {},
    updateElementPosition: updateElementPosition({
      elementsRef,
      onElementsChangeRef,
    }),
    updateElementPositionSilent: updateElementPositionSilent({
      elementsRef,
      onElementsChangeRef,
    }),
    getPosition: getPosition({ positionRef }),
    setPosition: withEventPosition(
      setPosition({
        boundary,
        childNode,
        containerNode,
        positionRef,
        zoomRef,
      }),
    ),
    getZoom: getZoom({ zoomRef }),
    setZoom: withEventZoom(
      setZoom({
        childNode,
        positionRef,
        zoomMax,
        zoomMin,
        zoomRef,
      }),
    ),
    zoomIn: withEventZoom(
      zoomIn({
        childNode,
        positionRef,
        zoomMax,
        zoomMin,
        zoomRef,
      }),
    ),
    zoomOut: withEventZoom(
      zoomOut({
        childNode,
        positionRef,
        zoomMax,
        zoomMin,
        zoomRef,
      }),
    ),
    reset: withEventAll(
      reset({
        childNode,
        positionRef,
        zoomRef,
      }),
    ),
  } as API;
};

export default useApi;
