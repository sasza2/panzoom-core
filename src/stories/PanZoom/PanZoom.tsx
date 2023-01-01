// eslint-disable-next-line import/no-extraneous-dependencies
import React, { forwardRef, MutableRefObject, useLayoutEffect } from 'react';

import { PanZoomApi, PanZoomOptions } from 'types';
import initPanZoom, { getAllowedPanZoomProps } from '@/index';
import usePanZoom from './usePanZoom';

const panZoomAllowedProps = getAllowedPanZoomProps();

const PanZoom: React.FC<PanZoomOptions & { apiRef?: MutableRefObject<PanZoomApi> }> = ({
  apiRef,
  children,
  ...props
}) => {
  const {
    childRef, panZoomRef, render, setInitialized,
  } = usePanZoom({
    allowedProps: panZoomAllowedProps,
    apiRef,
    children,
    props,
  });

  useLayoutEffect(() => {
    panZoomRef.current = initPanZoom(childRef.current, {
      ...props,
      className: props.className || 'react-panzoom',
    });
    setInitialized(true);
    return panZoomRef.current.destroy;
  }, []);

  return render;
};

const PanZoomRef = forwardRef((props: PanZoomOptions, ref: MutableRefObject<PanZoomApi>) => (
  <PanZoom {...props} apiRef={ref} />
)) as React.FC<PanZoomOptions & { ref?: MutableRefObject<PanZoomApi> }>;

export default PanZoomRef;
