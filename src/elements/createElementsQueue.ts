import { ElementApi, ElementOptions } from 'types'
import { Component, initializeComponent, RenderComponent } from '@/helpers/effects'
import ElementWrapper from './Element'

type AddElement = (elementNode: HTMLDivElement, elementOptions: ElementOptions) => ElementApi

type CreateElementQueue = () => {
  add: AddElement,
  queue: Array<Component>,
  unmount: () => void,
  setRender: (render: RenderComponent) => void,
}

const createElementsQueue: CreateElementQueue = () => {
  const queue: Array<Component> = []
  let render: RenderComponent = null

  const add: AddElement = (elementNode, elementOptions) => {
    const Element = ElementWrapper(elementNode)
    const elementComponent = initializeComponent(Element)
    elementComponent.updateProps(elementOptions)

    queue.push(elementComponent)
    render()

    const destroyElement = () => {
      elementComponent.unmount()
      const indexToRemove = queue.findIndex(current => current === elementComponent)
      if (indexToRemove < 0) return
      queue.splice(indexToRemove, 1)
      render()
    }

    const setOptionsElement = (elementOptions: ElementOptions) => {
      elementComponent.updateProps(elementOptions)
      render()
    }

    return {
      destroy: destroyElement,
      setOptions: setOptionsElement,
    }
  }

  const setRender = (currentRender: RenderComponent) => {
    render = currentRender
  }

  const unmount = () => {
    queue.forEach(elementComponent => {
      elementComponent.unmount()
    })
  }

  return {
    add,
    setRender,
    queue,
    unmount,
  }
}

export default createElementsQueue
