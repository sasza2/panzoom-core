import { PanZoomOptions, Ref } from 'types'

const mapPanZoomProps = (options: PanZoomOptions) => {
  const optionsMap = {} as Record<string, unknown>

  Object.entries(options).forEach(([key, value]) => {
    if (typeof value === 'function') {
      const ref = optionsMap[`${key}Ref`] as Ref<typeof value>
      if (ref) ref.current = value
    } else {
      optionsMap[key] = value
    }
  })
  return optionsMap
}

export default mapPanZoomProps
