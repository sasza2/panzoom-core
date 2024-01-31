let lastZIndex = 2;

const setNextZIndex = (elementNode: HTMLDivElement) => {
  lastZIndex += 1;
  elementNode.style.zIndex = lastZIndex.toString();
};

export default setNextZIndex;
