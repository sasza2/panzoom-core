import { PanZoomApi, PanZoomOptions } from './types';

export function getAllowedProps(): Array<keyof PanZoomOptions>;

export default function initPanZoom(
  childNode: HTMLDivElement,
  options?: PanZoomOptions,
): PanZoomApi;
