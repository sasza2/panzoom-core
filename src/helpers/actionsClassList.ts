const add = (childNode: HTMLDivElement, className: string) => {
  document.body.classList.add(className);
  (childNode?.parentNode as HTMLDivElement)?.classList?.add(`${className}-in`);
};

const remove = (childNode: HTMLDivElement, className: string) => {
  document.body.classList.remove(className);
  if (!document.body.getAttribute('class')) {
    document.body.removeAttribute('class');
  }
  (childNode?.parentNode as HTMLDivElement)?.classList?.remove(`${className}-in`);
};

export default {
  add,
  remove,
};
