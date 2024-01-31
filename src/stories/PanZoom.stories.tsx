// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useLayoutEffect, useState } from 'react';

import { PanZoomApi } from 'types';
import PanZoom, { Element } from './PanZoom';

const Rectangles = () => (
  <div style={{
    display: 'inline-block',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid green',
  }}
  >
    <PanZoom>
      <div style={{ width: 500, height: 400 }}>
        <Element id="a" x={50} y={90}>
          <div style={{
            width: 100,
            height: 100,
            backgroundColor: 'red',
          }}
          >
            111
          </div>
        </Element>
        <Element id="b" x={210} y={260}>
          <div style={{
            width: 40,
            height: 170,
            backgroundColor: 'blue',
            color: '#fff',
          }}
          >
            222
          </div>
        </Element>
      </div>
    </PanZoom>
  </div>
);

export const text = () => (
  <div style={{ height: 200 }}>
    <PanZoom disabledUserSelect>
      abcdef
    </PanZoom>
  </div>
);

export const imageSVG = () => (
  <div style={{ border: '1px solid red' }}>
    <PanZoom>
      <svg height="210" width="500">
        <polygon points="200,10 250,190 160,210" style={{ fill: 'lime', stroke: 'purple', strokeWidth: 1 }} />
      </svg>
    </PanZoom>
  </div>
);

export const imageSVGAnimation = () => {
  const ref = React.createRef<PanZoomApi>();
  useLayoutEffect(() => {
    const timer = setInterval(() => {
      ref.current.setPosition(120, Math.floor(Math.random() * 240 - 120));
    }, 500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div style={{ border: '1px solid red' }}>
      <PanZoom ref={ref}>
        <svg height="210" width="500">
          <polygon
            points="200,10 250,190 160,210"
            style={{ fill: 'lime', stroke: 'purple', strokeWidth: 1 }}
          />
        </svg>
      </PanZoom>
    </div>
  );
};

export const boxBounding = () => (
  <div style={{ border: '1px dashed #000', width: 400, height: 400 }}>
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `
          .react-panzoom__in {
            background-image: linear-gradient(45deg, #eee 25%, transparent 25%, transparent 50%, #eee 50%, #eee 75%, transparent 75%, #fff);
            background-size: 200px 200px;
          }
        `,
      }}
    />
    <PanZoom
      disabledUserSelect
      boundary
      height={5000}
      width={5000}
    >
      <Element id="orange">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            width: 120,
            height: 120,
            backgroundColor: 'orange',
            fontSize: 14,
          }}
        >
          <span>move me</span>
        </div>
      </Element>
      <Element id="red" x={100} y={150}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 60,
            backgroundColor: 'red',
            fontSize: 14,
          }}
        >
          <span>or me</span>
        </div>
      </Element>
    </PanZoom>
  </div>
);

export const resizableElements = () => (
  <div style={{ border: '1px dashed #000', height: 400 }}>
    <style
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: `
          .react-panzoom__in {
            background-color: #ddd;
          }
        `,
      }}
    />
    <PanZoom
      disabledUserSelect
      boundary
      width={800}
      height={400}
    >
      <Element id="orange" resizable resizedMaxWidth={400} width={100}>
        <div
          style={{
            aspectRatio: '1 / 1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            width: '100%',
            height: '100%',
            backgroundColor: 'orange',
            fontSize: 14,
          }}
        >
          <span>resize me</span>
        </div>
      </Element>
      <Element id="red" x={100} y={150} resizable>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: 60,
            backgroundColor: 'red',
            fontSize: 14,
          }}
        >
          <span>or me</span>
        </div>
      </Element>
    </PanZoom>
  </div>
);

export const selectingBoxes = () => {
  const [selecting, setSelecting] = useState(true);

  const toggle: React.ChangeEventHandler<HTMLInputElement> = (e) => setSelecting(e.target.checked);

  return (
    <>
      <label htmlFor="selecting">
        Selecting mode
        <input id="selecting" type="checkbox" onChange={toggle} checked={selecting} />
      </label>
      <div style={{ border: '1px dashed #000', width: 400, height: 400 }}>
        <PanZoom
          disabledUserSelect
          boundary
          height={5000}
          width={5000}
          selecting={selecting}
        >
          <Element id="orange" x={30} y={30}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                width: 120,
                height: 120,
                backgroundColor: 'orange',
                fontSize: 14,
              }}
            >
              <span>move me</span>
            </div>
          </Element>
          <Element id="red" x={100} y={150}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 60,
                height: 60,
                backgroundColor: 'red',
                fontSize: 14,
              }}
            >
              <span>or me</span>
            </div>
          </Element>
          <Element id="green" x={200} y={50}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                width: 100,
                height: 160,
                backgroundColor: 'green',
                fontSize: 14,
              }}
            >
              <span>hello world</span>
            </div>
          </Element>
        </PanZoom>
      </div>
    </>
  );
};

export const TwoInstances = () => {
  const [hasTwoInstances, setHasTwoInstances] = useState(true);
  const toggle: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setHasTwoInstances(e.target.checked);
  };

  return (
    <>
      <div style={{ border: '1px solid red', height: 300 }}>
        <PanZoom height={320}>
          <Element id="a">element A</Element>
        </PanZoom>
      </div>
      <label htmlFor="twoInstances">
        Has two instances
        <input id="twoInstances" type="checkbox" onChange={toggle} checked={hasTwoInstances} />
      </label>
      {
        hasTwoInstances && (
          <div style={{ border: '1px solid red', height: 300 }}>
            <PanZoom height={450}>
              <Element id="b">element B</Element>
              <Element id="c" x={100} y={100}>element C</Element>
            </PanZoom>
          </div>
        )
      }
    </>
  );
};

export default { title: 'PanZoom', component: Rectangles };
