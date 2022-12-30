import { Ref } from 'types'

type Value = object | string | number | boolean | undefined | null

type Dependencies = Array<Value>

type EffectHookOnUnmount = void | (() => void)

type EffectHookCallback = () => EffectHookOnUnmount

type EffectHook = { type: 'effect', deps: Dependencies, onUnmount: EffectHookOnUnmount, value: never }

type StateHook = { type: 'state', value: Value, deps: never, onUnmount: never }

type RefHook = { type: 'ref', value: Ref<Value>, deps: never, onUnmount: never }

type Hook = EffectHook | StateHook | RefHook

type Props = Record<string, unknown>

type Context = {
  it: number,
  hooks: Array<Hook>,
  render?: () => void,
  props: Props,
  onRerender?: () => void,
}

const HOOKS = {
  EFFECT: 'effect',
  REF: 'ref',
  STATE: 'state',
}

export type RenderComponent = () => void

export type Component = {
  context: Context,
  render: RenderComponent,
  unmount: () => void,
  updateProps: (props: Props) => void,
}

type InitializeComponent = (
  cb: (props: Props) => void,
  mapNextProps?: (props: Props) => Props,
) => Component

const contextQueue: Array<Context> = []

const getCurrentContext = () => contextQueue[contextQueue.length - 1]

export const createRef = <T> (value?: T): Ref<T> => ({ current: value })

export const render = (components: Array<Component>) => {
  const internalRender = () => {
    let isRenderingQueue = true
    let rerender = false
    components.forEach(component => {
      component.context.onRerender = () => {
        if (isRenderingQueue) rerender = true
        else internalRender()
      }
      component.render()
    })
    isRenderingQueue = false
    contextQueue.length = 0
    if (rerender) internalRender()
  }
  return internalRender()
}

export const initializeComponent: InitializeComponent = (cb, mapNextProps) => {
  const context: Context = {
    it: 0,
    hooks: [],
    render: () => {
      contextQueue.push(context)
      context.it = 0
      cb(context.props)
      contextQueue.pop()
    },
    props: {},
  }

  const unmount = () => {
    context.hooks.forEach(hook => {
      if (hook.type === HOOKS.EFFECT && hook.onUnmount) hook.onUnmount()
    })
  }

  const updateProps = (nextProps: Props) => {
    const mappedNextProps = mapNextProps ? mapNextProps(nextProps) : nextProps
    Object.entries(mappedNextProps).forEach(([key, value]) => {
      if (value !== undefined) context.props[key] = value
    })
  }

  return { context, render: context.render, unmount, updateProps }
}

const areDepsEqual = (prev: Dependencies, next: Dependencies) => {
  for (let i = 0; i < prev.length; i++) {
    if (prev[i] !== next[i]) return false
  }
  return true
}

export const useEffect = (cb: EffectHookCallback, deps: Dependencies) => {
  const context = getCurrentContext()
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
  const context = getCurrentContext()
  const currentIteration = context.it
  context.it++

  const updateValue = (next: T) => {
    const hook = context.hooks[currentIteration] as StateHook
    hook.value = next
    context.onRerender()
  }

  let hook = context.hooks[currentIteration] as StateHook
  if (!hook) {
    hook = context.hooks[currentIteration] = { type: HOOKS.STATE, value: initialValue } as StateHook
    return [initialValue, updateValue]
  }

  return [hook.value as T, updateValue]
}

export const useRef = <T extends Value>(initialValue?: T): Ref<T> => {
  const context = getCurrentContext()
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
