import { HOOKS } from './consts';
import contextQueue from './contextQueue';
import { Dependencies, EffectHook, EffectHookOnUnmount } from './types';

type EffectHookCallback = () => EffectHookOnUnmount

const areDepsEqual = (prev: Dependencies, next: Dependencies) => {
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== next[i]) return false;
  }
  return true;
};

const useEffect = (cb: EffectHookCallback, deps: Dependencies) => {
  const context = contextQueue.get();
  const currentIteration = context.it;
  context.it++;

  let hook = context.hooks[currentIteration] as EffectHook;
  if (!hook) {
    const onUnmount = cb();
    hook = { type: HOOKS.EFFECT, deps, onUnmount } as EffectHook;
    context.hooks[currentIteration] = hook;
    return;
  }

  if (areDepsEqual(hook.deps, deps)) return;

  if (hook.onUnmount) hook.onUnmount();
  const onUnmount = cb();
  hook.onUnmount = onUnmount;
  hook.deps = deps;
};

export default useEffect;
