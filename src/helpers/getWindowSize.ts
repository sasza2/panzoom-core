import getBoundingClientRect from './getBoundingClientRect';
import getWindow from './getWindow';

type Size = {
  width: number,
  height: number,
}

const getWindowSize = (): Size => {
  const bodyRect = getBoundingClientRect(document.body);
  const currentWindow = getWindow();

  if (!bodyRect.width || !bodyRect.height) {
    return {
      width: currentWindow.innerWidth,
      height: currentWindow.innerHeight,
    };
  }
  return {
    width: Math.min(bodyRect.width, currentWindow.innerWidth),
    height: Math.min(bodyRect.height, currentWindow.innerHeight),
  };
};

export default getWindowSize;
