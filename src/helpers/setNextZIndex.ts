const setNextZIndex = (elementNode: HTMLDivElement) => {
  const elementZIndex = Number(elementNode.style.zIndex);
  const newZIndex = (elementZIndex + 1 > 3) ? elementZIndex + 1 : 3;
  elementNode.style.zIndex = newZIndex.toString();
};

export default setNextZIndex;
