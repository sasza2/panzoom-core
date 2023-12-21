const clearStyleAttribute = (node: HTMLElement) => {
  if (!node.getAttribute('style')) node.removeAttribute('style');
};

export default clearStyleAttribute;
