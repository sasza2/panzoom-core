import {
  API, PanZoomApi, PanZoomOptions, Ref,
} from 'types';
import { createComponentQueue, render } from './helpers/effects';
import ElementsProvider, { createElementsQueue } from './elements';
import Select from './select';
import PanZoomProvider, { getDefaultContext, mapPanZoomProps } from './provider';
import PanZoom from './PanZoom';

let initializationId = 1;

const initPanZoom = (childNode: HTMLDivElement, options: PanZoomOptions = {}): PanZoomApi => {
  const initializeComponent = createComponentQueue(initializationId);
  const panZoomProvider = initializeComponent(PanZoomProvider, mapPanZoomProps);
  panZoomProvider.context.props = getDefaultContext(childNode, options);

  const elements = createElementsQueue(initializeComponent);

  const elementsProvider = initializeComponent(ElementsProvider);
  const panZoomComponent = initializeComponent(PanZoom);
  const selectComponent = initializeComponent(Select);

  const renderPanZoom = () => render([
    panZoomProvider,
    elementsProvider,
    panZoomComponent,
    ...elements.queue,
    selectComponent,
  ]);

  const setOptions = (nextOptions: PanZoomOptions) => {
    const shouldUpdate = panZoomProvider.updateProps(nextOptions);
    if (shouldUpdate) renderPanZoom();
  };

  const destroy = () => {
    elements.unmount();
    elementsProvider.unmount();
    selectComponent.unmount();
    panZoomComponent.unmount();
    panZoomProvider.unmount();
  };

  renderPanZoom();
  const apiRef = panZoomProvider.context.props.apiRef as Ref<API>;

  initializationId++;

  return {
    addElement: elements.add,
    destroy,
    setOptions,
    ...apiRef.current,
  };
};

export default initPanZoom;
