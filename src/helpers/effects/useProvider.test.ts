import { expect, it } from 'vitest';

import {
  createComponentQueue, render, useContext, useProvider,
} from './index';

it('effects/useProvider - provides and cleans up context value', () => {
  let received: unknown;

  const providerQueue = createComponentQueue(1);
  const provider = providerQueue((props: any) => {
    useProvider('my-context', props.value);
  });

  const consumerQueue = createComponentQueue(1);
  const consumer = consumerQueue(() => {
    received = useContext('my-context');
  });

  provider.updateProps({ value: 42 });
  render([provider]);
  render([consumer]);

  expect(received).toBe(42);

  provider.unmount();
  expect(useContext('my-context')).toBeUndefined();
});
