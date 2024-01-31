import { usePanZoom } from '@/provider';
import positionClone from '@/helpers/positionClone';

type ApiCallback = (...args: unknown[]) => unknown;

type DispatchOptions = { position: boolean; zoom: boolean };

type UseEventsCallback = () => {
  withEventAll: ApiCallback;
  withEventPosition: ApiCallback;
  withEventZoom: ApiCallback;
};

const useEventsCallback: UseEventsCallback = () => {
  const {
    onContainerChangeRef,
    onContainerPositionChangeRef,
    onContainerZoomChangeRef,
    positionRef,
    zoomRef,
  } = usePanZoom();

  const dispatchEvents = ({ position, zoom }: DispatchOptions) => {
    const eventValue = {
      position: positionClone(positionRef),
      zoom: zoomRef.current,
    };

    if (position && onContainerChangeRef.current) onContainerChangeRef.current(eventValue);
    if (position && onContainerPositionChangeRef.current) {
      onContainerPositionChangeRef.current(eventValue);
    }
    if (zoom && onContainerZoomChangeRef.current) onContainerZoomChangeRef.current(eventValue);
  };

  const withDispatch = (
    apiCallback: ApiCallback,
    options: DispatchOptions,
  ) => (...values: unknown[]) => {
    const result = apiCallback(...values);
    dispatchEvents(options);
    return result;
  };

  const withEventAll = (apiCallback: ApiCallback) => withDispatch(
    apiCallback,
    { position: true, zoom: true },
  );

  const withEventPosition = (apiCallback: ApiCallback) => withDispatch(
    apiCallback,
    { position: true, zoom: false },
  );

  const withEventZoom = (apiCallback: ApiCallback) => withDispatch(
    apiCallback,
    { position: false, zoom: true },
  );

  return {
    withEventAll,
    withEventPosition,
    withEventZoom,
  };
};

export default useEventsCallback;
