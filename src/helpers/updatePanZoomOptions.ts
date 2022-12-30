import { PanZoomContext, PanZoomOptions, Ref } from 'types'

const updatePanZoomOptions = (context: PanZoomContext, options: PanZoomOptions) => {
  const contextMap = context as Record<string, unknown>

  Object.entries(options).forEach(([key, value]) => {
    if (typeof value === 'function') {
      const ref = contextMap[`${key}Ref`] as Ref<typeof value>
      if (ref) ref.current = value
    } else {
      contextMap[key] = value
    }
  })
}

export default updatePanZoomOptions
