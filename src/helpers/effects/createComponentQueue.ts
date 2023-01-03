import { HOOKS } from './consts';
import contextQueue from './contextQueue';
import { Component, ComponentContext, Props } from './types';

type InitializeComponentCb = (props: Props) => void

type InitializeComponentMapProps = (props: Props) => Props

type InitializeComponent = (
  initializationId: number,
  cb: InitializeComponentCb,
  mapNextProps?: InitializeComponentMapProps,
) => Component

const initializeComponent: InitializeComponent = (initializationId, cb, mapNextProps) => {
  const context: ComponentContext = {
    batchTimeoutRender: null,
    it: 0,
    hooks: [],
    render: () => {
      contextQueue.push(context, initializationId);
      context.it = 0;
      cb(context.props);
      contextQueue.pop();
    },
    props: {},
  };

  const unmount = () => {
    context.hooks.forEach((hook) => {
      if (hook.type === HOOKS.EFFECT && hook.onUnmount) hook.onUnmount();
    });
  };

  const updateProps = (nextProps: Props): boolean => {
    const mappedNextProps = mapNextProps ? mapNextProps(nextProps) : nextProps;
    let shouldUpdate = false;
    Object.entries(mappedNextProps).forEach(([key, value]) => {
      if (value === undefined) return;
      const property = context.props[key];
      if (property && typeof property === 'object' && 'current' in property) {
        property.current = value;
      } else {
        context.props[key] = value;
        shouldUpdate = true;
      }
    });
    return shouldUpdate;
  };

  return {
    context, render: context.render, unmount, updateProps,
  };
};

const createComponentQueue = (id = 0) => (
  cb: InitializeComponentCb,
  mapNextProps?: InitializeComponentMapProps,
) => initializeComponent(id, cb, mapNextProps);

export default createComponentQueue;
