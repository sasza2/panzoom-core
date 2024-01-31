const add = (className: string) => {
  document.body.classList.add(className);
};

const remove = (className: string) => {
  document.body.classList.remove(className);
  if (!document.body.getAttribute('class')) {
    document.body.removeAttribute('class');
  }
};

export default {
  add,
  remove,
};
