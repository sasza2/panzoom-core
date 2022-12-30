import { ElementApi, ElementOptions, PanZoomApi, PanZoomOptions } from 'types'
import { initializeComponent, Component } from './helpers/effects';
import useElementAutoMoveAtEdge from './hooks/useElementAutoMoveAtEdge'
import useMove from './hooks/useMove'
import useZoom from './hooks/useZoom'
import { createPanZoomProvider } from './panZoomProvider'
import addElement, { withElementsProvider } from './elements'
import initSelect, { withSelectProvider } from './select'
import updatePanZoomOptions from './helpers/updatePanZoomOptions'

const initPanZoom = (childNode: HTMLDivElement, options: PanZoomOptions = {}): PanZoomApi => {
  const elementComponents: Array<Component> = []
  const [withPanZoomProvider, getPanZoomContext] = createPanZoomProvider(childNode, options)

  const selectComponent = initializeComponent(initSelect)

  const panZoomComponent = initializeComponent(() => {
    withPanZoomProvider(() => {
      withElementsProvider(() => {
        useMove()
        useZoom()
        useElementAutoMoveAtEdge()

        elementComponents.forEach(elementComponent => {
          elementComponent.render()
        })

        withSelectProvider(() => {
          selectComponent.render()
        })
      })
    })

  })

  const addElementWrapper= (node: HTMLDivElement, elementOptions: ElementOptions): ElementApi => {
    const element = addElement(node, elementOptions)
    elementComponents.push(element.component)
    panZoomComponent.render()

    const destroyElement = () => {
      element.destroy()
      const indexToRemove = elementComponents.findIndex(elementComponent => elementComponent === element.component)
      if (indexToRemove < 0) return
      elementComponents.splice(indexToRemove, 1)
      panZoomComponent.render()
    }

    const setOptionsElement = (elementOptions: ElementOptions) => {
      element.setOptions(elementOptions)
      panZoomComponent.render()
    }

    return {
      destroy: destroyElement,
      setOptions: setOptionsElement,
    }
  }

  const setOptions = (options: PanZoomOptions) => {
    updatePanZoomOptions(getPanZoomContext(), options)
    panZoomComponent.render()
  }

  panZoomComponent.render()

  const destroy = () => {
    selectComponent.unmount()
    elementComponents.forEach(elementComponent => {
      elementComponent.unmount()
    })
    panZoomComponent.unmount()
  }

  return {
    addElement: addElementWrapper,
    destroy,
    setOptions,
  }
}

export default initPanZoom
