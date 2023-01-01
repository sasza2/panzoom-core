const applyStyles = (node: HTMLElement, styles: Record<string, string>): () => void => {
  Object.entries(styles).forEach(([key, value]) => {
    node.style.setProperty(key, value);
  });
  return () => {
    Object.entries(styles).forEach(([key]) => {
      node.style.removeProperty(key);
    });
  };
};

export default applyStyles;
