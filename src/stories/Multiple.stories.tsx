// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useEffect, useRef, useState } from 'react';

import { PanZoomApi } from 'types';
import initPanZoom from '@/initPanZoom';

export default { title: 'Multiple' };

const ELEMENTS = 50;

export const Multiple = () => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const panZoomRef = useRef<PanZoomApi>();
  const childNode = useRef<HTMLDivElement>();

  useEffect(() => () => {
    if (panZoomRef.current) panZoomRef.current.destroy();
  }, []);

  useEffect(() => {
    if (initialized) {
      panZoomRef.current = initPanZoom(childNode.current);
      for (let i = 0; i < ELEMENTS; i++) {
        panZoomRef.current.addElement(
          document.querySelector(`[data-id="element-${i}"]`),
          { id: i.toString(), x: i * 10, y: i * 10 },
        );
      }
    } else if (panZoomRef.current) {
      panZoomRef.current.destroy();
      panZoomRef.current = null;
    }
  }, [initialized]);

  const renderElements = () => {
    const elements = [];
    for (let i = 0; i < ELEMENTS; i++) elements.push(<div key={i} data-id={`element-${i}`}>{i}</div>);
    return elements;
  };

  return (
    <>
      {
        initialized
          ? (
            <button type="button" onClick={() => setInitialized(false)}>
              Unmount
            </button>
          )
          : (
            <button type="button" onClick={() => setInitialized(true)}>
              Mount
            </button>
          )
      }
      <div>
        <div ref={childNode}>
          {renderElements()}
        </div>
      </div>
    </>
  );
};
