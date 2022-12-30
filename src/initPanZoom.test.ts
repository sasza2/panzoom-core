import { expect, it,  } from 'vitest';

import initPanZoom from './initPanZoom'

it('initPanZoom', () => {
  const childNode = document.createElement('div')
  const containerNode = document.createElement('div')
  containerNode.appendChild(childNode)

  initPanZoom(childNode)
})
