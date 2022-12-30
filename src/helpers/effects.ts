import { Ref } from 'types'

type Value = object | string | number | boolean | undefined | null

type Dependencies = Array<Value>

type EffectHookOnUnmount = void | (() => void)

type EffectHookCallback = () => EffectHookOnUnmount

type EffectHook = { type: 'effect', deps: Dependencies, onUnmount: EffectHookOnUnmount, value: never }

type StateHook = { type: 'state', value: Value, deps: never, onUnmount: never }

type RefHook = { type: 'ref', value: Ref<Value>, deps: never, onUnmount: never }

type Hook = EffectHook | StateHook | RefHook

type Context = {
  it: number,
  hooks: Array<Hook>,
  rerun: () => void,
  rerunTimeout: ReturnType<typeof setTimeout>,
}

const HOOKS = {
  EFFECT: 'effect',
  REF: 'ref',
  STATE: 'state',
}

type RenderComponent = () => void

export type Component = { render: RenderComponent, unmount: () => void }

type InitializeComponent = (cb: () => void) => Component

let context: Context = null
let mainContext: Context = null

export const createRef = <T> (value: T): Ref<T> => ({ current: value })

export const createExternalContext = <T>() => createRef(null as T)

export const rerenderWithContext = <T>(externalContext: Ref<T>, value: T, cb: () => void) => {
  externalContext.current = value
  cb()
  externalContext.current = null
}

export const initializeComponent: InitializeComponent = (cb) => {
  let render: RenderComponent = null

  const currentContext: Context = {
    it: 0,
    hooks: [],
    rerun: () => {
      if (currentContext.rerunTimeout) {
        clearTimeout(currentContext.rerunTimeout)
      }
      currentContext.rerunTimeout = setTimeout(() => {
        currentContext.rerunTimeout = null
        render()
      }, 0)
    },
    rerunTimeout: null,
  }

  render = () => {
    if (!mainContext) mainContext = currentContext
    const prevContext = context
    context = currentContext
    context.it = 0
    cb()
    if (mainContext === currentContext) mainContext = null
    context = prevContext
  }

  const unmount = () => {
    currentContext.hooks.forEach(hook => {
      if (hook.type === HOOKS.EFFECT && hook.onUnmount) hook.onUnmount()
    })
  }

  return { render, unmount }
}

const areDepsEqual = (prev: Dependencies, next: Dependencies) => {
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== next[i]) return false
  }
  return true
}

export const useEffect = (cb: EffectHookCallback, deps: Dependencies) => {
  const currentIteration = context.it
  context.it++

  let hook = context.hooks[currentIteration] as EffectHook
  if (!hook) {
    const onUnmount = cb()
    hook = context.hooks[currentIteration] = { type: HOOKS.EFFECT, deps, onUnmount } as EffectHook
    return
  }

  const shouldRun = areDepsEqual(hook.deps, deps)
  if (shouldRun) return

  if (hook.onUnmount) hook.onUnmount()
  const onUnmount = cb()
  hook.onUnmount = onUnmount
  hook.deps = deps
}

export const useState = <T extends Value>(initialValue: T): [T, (next: T) => void] => {
  const currentIteration = context.it
  context.it++

  const hookMainContext: Context = mainContext
  const hookContext: Context = context

  const updateValue = (next: T) => {
    const hook = hookContext.hooks[currentIteration] as StateHook
    hook.value = next
    hookMainContext.rerun()
  }

  let hook = context.hooks[currentIteration] as StateHook
  if (!hook) {
    hook = context.hooks[currentIteration] = { type: HOOKS.STATE, value: initialValue } as StateHook
    return [initialValue, updateValue]
  }

  return [hook.value as T, updateValue]
}

export const useRef = <T extends Value>(initialValue?: T): Ref<T> => {
  const currentIteration = context.it
  context.it++

  let hook = context.hooks[currentIteration] as RefHook
  if (!hook) {
    const value = { current: initialValue || null } as Ref<T>
    hook = context.hooks[currentIteration] = { type: HOOKS.REF, value } as unknown as RefHook // TODO
    return value
  }

  return hook.value as Ref<T>
}
