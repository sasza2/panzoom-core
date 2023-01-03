import { Ref } from 'types';
import { HOOKS } from './consts';

export type Value = object | string | number | boolean | undefined | null;

export type Dependencies = Array<Value>

export type RefHook = {
  type: typeof HOOKS.REF,
  value: Ref<Value>,
  deps?: never,
  onUnmount?: never,
}

export type EffectHookOnUnmount = void | (() => void)

export type EffectHook = {
  type: typeof HOOKS.EFFECT,
  deps: Dependencies,
  onUnmount: EffectHookOnUnmount,
  value: never,
}

export type StateHook = {
  type: typeof HOOKS.STATE,
  value: Value,
  deps?: never,
  onUnmount?: never,
}

export type Hook = EffectHook | StateHook | RefHook

export type Props = Record<string, unknown>

export type RenderComponent = () => void

export type ComponentContext = {
  batchTimeoutRender: ReturnType<typeof setTimeout>,
  it: number,
  hooks: Array<Hook>,
  render?: () => void,
  props: Props,
}

export type Component = {
  context: ComponentContext,
  render: RenderComponent,
  unmount: () => void,
  updateProps: (props: Props) => boolean,
}
