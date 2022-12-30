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
