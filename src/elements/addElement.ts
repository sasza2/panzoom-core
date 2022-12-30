import { ElementOptions } from 'types'
import { initializeComponent } from '@/helpers/effects'
import initElement from './initElement'

const addElement = (node: HTMLDivElement, elementOptions: ElementOptions) => {
  const [componentElement, setOptions] = initElement(node, elementOptions);

  const component = initializeComponent(componentElement)

  return {
    destroy: component.unmount,
    setOptions,
    component,
  }
}

export default addElement
