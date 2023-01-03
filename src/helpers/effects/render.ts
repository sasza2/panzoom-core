import { Component } from './types';

const render = (components: Array<Component>) => {
  components.forEach((component) => {
    component.render();
  });
};

export default render;
