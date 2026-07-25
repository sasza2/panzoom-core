import { expect, it } from 'vitest';

import actionsClassList from './actionsClassList';

it('helpers/actionsClassList - add/remove with parent', () => {
  const parent = document.createElement('div');
  const childNode = document.createElement('div');
  parent.appendChild(childNode);

  actionsClassList.add(childNode, 'my-class');
  expect(document.body.classList.contains('my-class')).toBe(true);
  expect(parent.classList.contains('my-class-in')).toBe(true);

  actionsClassList.remove(childNode, 'my-class');
  expect(document.body.classList.contains('my-class')).toBe(false);
  expect(parent.classList.contains('my-class-in')).toBe(false);
});

it('helpers/actionsClassList - add/remove without parent', () => {
  const childNode = document.createElement('div');

  actionsClassList.add(childNode, 'orphan-class');
  expect(document.body.classList.contains('orphan-class')).toBe(true);

  actionsClassList.remove(childNode, 'orphan-class');
  expect(document.body.classList.contains('orphan-class')).toBe(false);
  expect(document.body.hasAttribute('class')).toBe(false);
});
