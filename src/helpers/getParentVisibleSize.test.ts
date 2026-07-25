import { expect, it, vi } from 'vitest';

import getParentVisibleSize from './getParentVisibleSize';

it('getParentVisibleWidth', () => {
  const childNode = document.createElement('div')
  const containerNode = document.createElement('div')
  containerNode.style.width = '500px'
  containerNode.style.height = '300px'

  containerNode.appendChild(childNode)
  document.body.appendChild(containerNode)
  childNode.style.setProperty('display', '')
  containerNode.style.setProperty('display', '');

  /*vi.mock('@/helpers/getBoundingClientRect.ts', () => ({
    default: () => ({
      width: 10000,
    }),
  }))*/

  const [width, height] = getParentVisibleSize(childNode)
  // expect(width).toBe(10)
})

it('getParentVisibleWidth - considers ancestor node rects and clamps negatives to 0', () => {
  const outer = document.createElement('div');
  const parent = document.createElement('div');
  const childNode = document.createElement('div');

  outer.appendChild(parent);
  parent.appendChild(childNode);
  document.body.appendChild(outer);

  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 2000, right: 2500, top: 2000, bottom: 2500,
  } as DOMRect);
  vi.spyOn(outer, 'getBoundingClientRect').mockReturnValue({
    left: -100, right: 50, top: -100, bottom: 50,
  } as DOMRect);

  const [width, height] = getParentVisibleSize(childNode);
  expect(width).toBeGreaterThanOrEqual(0);
  expect(height).toBeGreaterThanOrEqual(0);
})

it('getParentVisibleWidth - ancestor chain outside <body> reaches `document`, which has no getBoundingClientRect', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);
  // append under <html> (not <body>) so loopParentNodes' "stop at body"
  // check never fires, and the walk continues past <html> up to the
  // `document` node itself, which lacks getBoundingClientRect.
  document.documentElement.appendChild(parent);

  vi.spyOn(parent, 'getBoundingClientRect').mockReturnValue({
    left: 0, right: 500, top: 0, bottom: 500,
  } as DOMRect);

  try {
    expect(() => getParentVisibleSize(childNode)).not.toThrow();
  } finally {
    document.documentElement.removeChild(parent);
  }
})
