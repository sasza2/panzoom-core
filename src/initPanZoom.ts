import { ElementApi, ElementOptions, PanZoomApi, PanZoomOptions } from 'types'
import { initializeComponent, Component, render } from './helpers/effects';
import ElementsProvider, { createElement } from './elements'
import Select, { SelectProvider } from './select'
import PanZoomProvider, { getDefaultContext, mapPanZoomProps } from './provider'
import PanZoom from './PanZoom'
import PanZoomFeatures from './PanZoomFeatures'

const initPanZoom = (childNode: HTMLDivElement, options: PanZoomOptions = {}): PanZoomApi => {
  const elementComponents: Array<Component> = []

  const panZoomProvider = initializeComponent(PanZoomProvider, mapPanZoomProps)
  panZoomProvider.updateProps(getDefaultContext(childNode, options))

  const panZoomComponent = initializeComponent(PanZoom)
  const panZoomFeaturesComponent = initializeComponent(PanZoomFeatures)
  const elementsProvider = initializeComponent(ElementsProvider)
  const selectProvider = initializeComponent(SelectProvider)
  const selectComponent = initializeComponent(Select)

  const renderPanZoom = () => render([
    panZoomProvider,
    panZoomComponent,
    elementsProvider,
    panZoomFeaturesComponent,
    ...elementComponents,
    selectProvider,
    selectComponent,
  ])

  const addElementWrapper= (node: HTMLDivElement, elementOptions: ElementOptions): ElementApi => {
    const Element = createElement(node)
    const elementComponent = initializeComponent(Element)
    elementComponent.updateProps(elementOptions)

    elementComponents.push(elementComponent)
    renderPanZoom()

    const destroyElement = () => {
      elementComponent.unmount()
      const indexToRemove = elementComponents.findIndex(current => current === elementComponent)
      if (indexToRemove < 0) return
      elementComponents.splice(indexToRemove, 1)
      renderPanZoom()
    }

    const setOptionsElement = (elementOptions: ElementOptions) => {
      elementComponent.updateProps(elementOptions)
      renderPanZoom()
    }

    return {
      destroy: destroyElement,
      setOptions: setOptionsElement,
    }
  }

  const setOptions = (options: PanZoomOptions) => {
    panZoomProvider.updateProps(options)
    renderPanZoom()
  }

  renderPanZoom()

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
