import { Position, Ref, Zoom } from 'types';
import produceStyle from '@/helpers/produceStyle';
import zoomRound from '@/helpers/zoomRound';

type GetZoom = (props: { zoomRef: Zoom }) => () => number;

export const getZoom: GetZoom = ({ zoomRef }) => () => zoomRef.current;

type SetZoom = (props: {
  childNode: HTMLDivElement;
  positionRef: Ref<Position>;
  zoomRef: Zoom;
}) => (value: number) => void;

export const setZoom: SetZoom = ({ childNode, positionRef, zoomRef }) => (value) => {
  const zoom = zoomRef;
  zoom.current = zoomRound(value);
  childNode.style.transform = produceStyle({
    position: positionRef.current,
    zoom: zoomRef.current,
  });
};

type ZoomIn = SetZoom;

export const zoomIn: ZoomIn = ({ childNode, positionRef, zoomRef }) => (value) => {
  setZoom({ childNode, positionRef, zoomRef })(getZoom({ zoomRef })() + value);
};

type ZoomOut = SetZoom;

export const zoomOut: ZoomOut = ({ childNode, positionRef, zoomRef }) => (value) => {
  setZoom({ childNode, positionRef, zoomRef })(getZoom({ zoomRef })() - value);
};
