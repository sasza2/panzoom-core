import { expect, it } from 'vitest';

import {
  createComponentQueue, render, useEffect, useRef,
} from './index';

it('effects/createComponentQueue - unmount runs effect cleanups once', () => {
  let unmountCount = 0;
  const initializeComponent = createComponentQueue();
  const component = initializeComponent(() => {
    useEffect(() => () => {
      unmountCount++;
    }, []);
  });

  render([component]);
  component.unmount();
  expect(unmountCount).toBe(1);

  // second unmount call should be a no-op
  component.unmount();
  expect(unmountCount).toBe(1);
});

it('effects/createComponentQueue - render after unmount is a no-op', () => {
  let renderCount = 0;
  const initializeComponent = createComponentQueue();
  const component = initializeComponent(() => {
    renderCount++;
  });

  render([component]);
  expect(renderCount).toBe(1);

  component.unmount();
  component.render();
  expect(renderCount).toBe(1);
});

it('effects/createComponentQueue - updateProps sets scalar props and reports change', () => {
  const initializeComponent = createComponentQueue();
  const component = initializeComponent(() => {});

  const shouldUpdate = component.updateProps({ value: 'a' });
  expect(shouldUpdate).toBe(true);
  expect(component.context.props.value).toBe('a');
});

it('effects/createComponentQueue - updateProps writes through ref-backed props without flagging update', () => {
  const initializeComponent = createComponentQueue();
  const component = initializeComponent(() => {});

  component.context.props.value = { current: 'initial' };

  const shouldUpdate = component.updateProps({ value: 'next' });
  expect(shouldUpdate).toBe(false);
  expect((component.context.props.value as any).current).toBe('next');
});

it('effects/createComponentQueue - updateProps ignores undefined values, applies mapNextProps', () => {
  const initializeComponent = createComponentQueue();
  const component = initializeComponent(() => {}, (nextProps) => ({ ...nextProps, mapped: true }));

  const shouldUpdate = component.updateProps({ value: undefined, other: 1 });
  expect(shouldUpdate).toBe(true);
});
