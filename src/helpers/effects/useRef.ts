import { Ref } from 'types';
import { HOOKS } from './consts';
import contextQueue from './contextQueue';
import { RefHook, Value } from './types';

const useRef = <T extends Value>(initialValue?: T): Ref<T> => {
  const context = contextQueue.get();
  const currentIteration = context.it;
  context.it++;

  let hook = context.hooks[currentIteration] as RefHook;
  if (!hook) {
    const value = { current: initialValue || null } as Ref<T>;
    hook = { type: HOOKS.REF, value } as RefHook;
    context.hooks[currentIteration] = hook;
    return value;
  }

  return hook.value as Ref<T>;
};

export default useRef;
