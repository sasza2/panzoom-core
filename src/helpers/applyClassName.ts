const applyClassName = (node: HTMLElement, classNames: string): () => void => {
  const classList = classNames.trim().split(' ').filter((cls) => cls);
  classList.forEach((className) => {
    node.classList.add(className);
  });
  return () => {
    classList.forEach((className) => {
      node.classList.remove(className);
    });
    if (!node.className) node.removeAttribute('class');
  };
};

export default applyClassName;
