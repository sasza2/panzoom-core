import { PanZoomOptions, Ref } from 'types'
import getAllowedProps from './getAllowedProps'

const mapPanZoomProps = (options: PanZoomOptions) => {
  const optionsMap = {} as Record<string, unknown>

  const allowedProps = getAllowedProps()
  Object.entries(options).forEach(([key, value]) => {
    if (!allowedProps.includes(key as keyof PanZoomOptions) || value === undefined) return

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
