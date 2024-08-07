const setNextZIndex = (elementNode: HTMLDivElement) => {
  newZIndex = (Number(elementNode.style.zIndex) + 1  > 3) ? Number(elementNode.style.zIndex) + 1 : 3;
  elementNode.style.zIndex = newZIndex.toString();
};

export default setNextZIndex;
