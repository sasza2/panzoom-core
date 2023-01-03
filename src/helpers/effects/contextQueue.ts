import { ComponentContext } from './types';

let initializationId: number = null;

const contextQueue: Array<ComponentContext> = [];

const get = () => contextQueue[contextQueue.length - 1];

const push = (context: ComponentContext, currentInitializationId: number) => {
  contextQueue.push(context);
  initializationId = currentInitializationId;
};

const pop = () => contextQueue.pop();

const getInitializationId = () => initializationId;

export default {
  get,
  getInitializationId,
  push,
  pop,
};
