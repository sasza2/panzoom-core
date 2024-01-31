// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useEffect, useRef, useState } from 'react';

import { PanZoomApi } from 'types';
import initPanZoom from '@/initPanZoom';

export default { title: 'Init' };

export const Init = () => {
  const [initialized, setInitialized] = useState<boolean>(false);
  const panZoomRef = useRef<PanZoomApi>();
  const childNode = useRef<HTMLDivElement>();

  useEffect(() => () => {
    if (panZoomRef.current) panZoomRef.current.destroy();
  }, []);

  useEffect(() => {
    if (initialized) {
      panZoomRef.current = initPanZoom(childNode.current, { height: 200 });
      panZoomRef.current.addElement(
        document.querySelector('[data-id="element-a"]'),
        { id: 'element', x: 50, y: 50 },
      );
    } else if (panZoomRef.current) {
      panZoomRef.current.destroy();
      panZoomRef.current = null;
    }
  }, [initialized]);

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
          <div data-id="element-a">element A</div>
          <div data-id="element-b">Test</div>
        </div>
      </div>
    </>
  );
};
