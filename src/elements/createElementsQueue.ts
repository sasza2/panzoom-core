import { ElementApi, ElementOptions } from 'types';
import { Component, createComponentQueue } from '@/helpers/effects';
import ElementWrapper from './Element';

type AddElement = (elementNode: HTMLDivElement, elementOptions: ElementOptions) => ElementApi

type CreateElementQueue = (initializeComponent: ReturnType<typeof createComponentQueue>) => {
  add: AddElement,
  queue: Array<Component>,
  unmount: () => void,
}

const createElementsQueue: CreateElementQueue = (initializeComponent) => {
  const queue: Array<Component> = [];

  const add: AddElement = (elementNode, elementOptions) => {
    const Element = ElementWrapper(elementNode);
    const elementComponent = initializeComponent(Element);
    elementComponent.updateProps(elementOptions);

    queue.push(elementComponent);
    elementComponent.render();

    const destroyElement = () => {
      elementComponent.unmount();
      const indexToRemove = queue.findIndex((current) => current === elementComponent);
      if (indexToRemove < 0) return;
      queue.splice(indexToRemove, 1);
    };

    const setOptionsElement = (nextElementOptions: ElementOptions) => {
      elementComponent.updateProps(nextElementOptions);
      elementComponent.render();
    };

    return {
      destroy: destroyElement,
      setOptions: setOptionsElement,
    };
  };

  const unmount = () => {
    queue.forEach((elementComponent) => {
      elementComponent.unmount();
    });
  };

  return {
    add,
    queue,
    unmount,
  };
};

export default createElementsQueue;
