// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useContext, useLayoutEffect, useRef } from 'react';

import { ElementApi, ElementOptions } from 'types';
import ElementsContext from './ElementsContext';
import useDidUpdateEffect from './useDidUpdateEffect';

const Element: React.FC<ElementOptions> = ({
  children,
  className,
  disabled,
  height,
  id,
  onAfterResize,
  onStartResizing,
  onClick,
  onContextMenu,
  resizable,
  resizedMaxWidth,
  width,
  x,
  y,
}) => {
  const nodeRef = useRef<HTMLDivElement>();
  const elementRef = useRef<ElementApi>();
  const { initialized, panZoomRef } = useContext(ElementsContext);

  const options = {
    className: className || 'react-panzoom-element',
    id,
    disabled,
    height,
    onAfterResize,
    onStartResizing,
    onClick,
    onContextMenu,
    resizable,
    resizedMaxWidth,
    width,
    x,
    y,
  };

  useLayoutEffect(() => {
    if (!initialized) return undefined;

    elementRef.current = panZoomRef.current.addElement(nodeRef.current, options);
    return elementRef.current.destroy;
  }, [initialized]);

  useDidUpdateEffect(() => {
    elementRef.current.setOptions(options);
  }, [disabled, id, onClick, onContextMenu, x, y]);

  return (
    <div ref={nodeRef}>{children}</div>
  );
};

export default Element;
