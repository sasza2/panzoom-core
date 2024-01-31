import { HOOKS } from './consts';
import contextQueue from './contextQueue';
import { StateHook, Value } from './types';

const useState = <T extends Value>(initialValue: T): [T, (next: T) => void] => {
  const context = contextQueue.get();
  const currentIteration = context.it;
  context.it++;

  let hook = context.hooks[currentIteration] as StateHook;

  const updateValue = (next: T) => {
    hook.value = next;
    clearTimeout(context.batchTimeoutRender);
    context.batchTimeoutRender = setTimeout(context.render, 0);
  };

  if (!hook) {
    hook = { type: HOOKS.STATE, value: initialValue } as StateHook;
    context.hooks[currentIteration] = hook;
    return [initialValue, updateValue];
  }

  return [hook.value as T, updateValue];
};

export default useState;
