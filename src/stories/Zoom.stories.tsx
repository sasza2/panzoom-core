// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useEffect, useRef, useState } from 'react';

import { PanZoomApi } from 'types';
import initPanZoom from '@/initPanZoom';

export default { title: 'Zoom' };

const height = window.innerHeight - 100;

export const Zoom = () => {
  const [zoomCenter, setZoomCenter] = useState<boolean>(false);
  const panZoomRef = useRef<PanZoomApi>();
  const childNode = useRef<HTMLDivElement>();

  useEffect(() => {
    if (panZoomRef.current) panZoomRef.current.destroy();

    panZoomRef.current = initPanZoom(childNode.current, {
      boundary: true,
      height,
      zoomMin: 1,
    });
    panZoomRef.current.addElement(
      document.querySelector('[data-id="element-a"]'),
      { id: 'element', x: 50, y: 50 },
    );

    return () => {
      if (panZoomRef.current) panZoomRef.current.destroy();
    };
  }, []);

  useEffect(() => {
    if (!panZoomRef.current) return;

    panZoomRef.current.setOptions({
      zoomPosition: zoomCenter ? { x: 'center', y: 'center' } : null,
    });
  }, [zoomCenter]);

  return (
    <>
      {
        zoomCenter
          ? (
            <button type="button" onClick={() => setZoomCenter(false)}>
              zoom in cursor
            </button>
          )
          : (
            <button type="button" onClick={() => setZoomCenter(true)}>
              zoom in center
            </button>
          )
      }
      <div style={{ border: '1px dashed #555', height }}>
        <div ref={childNode}>
          <div data-id="element-a">element A</div>
          <div data-id="element-b">Test</div>
          <div style={{
            alignItems: 'center',
            backgroundColor: '#ddd',
            display: 'flex',
            justifyContent: 'center',
            position: 'absolute',
            top: 'calc(50% - 15px)',
            left: 'calc(50% - 50px)',
            height: 30,
            width: 100,
          }}
          >
            center
          </div>
        </div>
      </div>
    </>
  );
};
