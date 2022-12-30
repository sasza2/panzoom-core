import { PanZoomApi, PanZoomOptions } from 'types'
import { initializeComponent, render } from './helpers/effects';
import ElementsProvider, { createElementsQueue } from './elements'
import Select, { SelectProvider } from './select'
import PanZoomProvider, { getDefaultContext, mapPanZoomProps } from './provider'
import PanZoom from './PanZoom'

const initPanZoom = (childNode: HTMLDivElement, options: PanZoomOptions = {}): PanZoomApi => {
  const panZoomProvider = initializeComponent(PanZoomProvider, mapPanZoomProps)
  panZoomProvider.context.props = getDefaultContext(childNode, options)

  const elements = createElementsQueue()

  const elementsProvider = initializeComponent(ElementsProvider)
  const panZoomComponent = initializeComponent(PanZoom)
  const selectProvider = initializeComponent(SelectProvider)
  const selectComponent = initializeComponent(Select)

  const renderPanZoom = () => render([
    panZoomProvider,
    elementsProvider,
    panZoomComponent,
    ...elements.queue,
    selectProvider,
    selectComponent,
  ])

  elements.setRender(renderPanZoom)

  const setOptions = (options: PanZoomOptions) => {
    panZoomProvider.updateProps(options)
    renderPanZoom()
  }

  const destroy = () => {
    selectComponent.unmount()
    elements.unmount()
    panZoomComponent.unmount()
  }

  renderPanZoom()

  return {
    addElement: elements.add,
    destroy,
    setOptions,
  }
}

export default initPanZoom
