import {
  Elements, ElementId, ElementOnAfterResize, ElementResizeOptions, Zoom, ElementOnStartResizing,
} from 'types';
import { ELEMENT_RESIZED_MIN_WIDTH, ELEMENT_RESIZER_WIDTH } from '@/consts';
import applyClassName from '@/helpers/applyClassName';
import actionsClassList from '@/helpers/actionsClassList';
import { useEffect, useRef } from '@/helpers/effects';
import { onMouseDown, onMouseMove, onMouseUp } from '@/helpers/eventListener';
import getWindow from '@/helpers/getWindow';
import positionFromEvent from '@/helpers/positionFromEvent';
import produceElementPosition from '@/helpers/produceElementPosition';
import produceStyle from '@/helpers/produceStyle';
import setNextZIndex from '@/helpers/setNextZIndex';
import { useElements } from '@/elements';
import { usePanZoom } from '@/provider';

type Resizer = (options: {
  childNode: HTMLDivElement,
  elementNode: HTMLDivElement,
  elementsRef: Elements,
  id: ElementId,
  onAfterResize: () => void,
  onStartResizing: () => void,
  resizerWidth: number,
  updateZIndex: boolean,
  zoomRef: Zoom,
} & ElementResizeOptions) => (() => void);

type UseElementResize = (
  elementNode: HTMLDivElement,
  options: ElementResizeOptions & { updateZIndex: boolean },
) => void;

const getResizerWidth = (resizerWidth: number): string => `${resizerWidth}px`;

const handleResizeEvent = ({
  className,
  elementNode,
  cb,
  onAfterResize,
  resizerNode,
  updateZIndex,
}: {
  className?: string,
  elementNode: HTMLDivElement,
  cb: (e: MouseEvent) => () => void,
  onAfterResize: () => void,
  resizerNode: HTMLDivElement,
  updateZIndex: boolean,
}) => {
  onMouseDown(resizerNode, (e) => {
    if (e.button) return;

    e.preventDefault();
    e.stopPropagation();

    const clearClassName = applyClassName(elementNode, `${className}--resizing`);

    const cleanOnMouseMove = cb(e);

    let cleanOnMouseUp: () => void = null;

    const handleMouseUp = () => {
      clearClassName();
      cleanOnMouseMove();
      cleanOnMouseUp();
      onAfterResize();
    };

    cleanOnMouseUp = onMouseUp(resizerNode, handleMouseUp);

    if (updateZIndex) {
      setNextZIndex(elementNode);
    }
  });
};

const createResizerNode = () => {
  const node = document.createElement('div');
  node.style.position = 'absolute';
  return node;
};

const createLeftResizer: Resizer = ({
  childNode,
  className,
  elementNode,
  elementsRef,
  id,
  onAfterResize,
  onStartResizing,
  resizedMaxWidth,
  resizedMinWidth,
  resizerWidth,
  updateZIndex,
  zoomRef,
}) => {
  const left = createResizerNode();
  left.style.left = '0px';
  left.style.top = '0px';
  left.style.width = getResizerWidth(resizerWidth);
  left.style.height = '100%';
  left.style.cursor = 'w-resize';

  handleResizeEvent({
    className,
    elementNode,
    resizerNode: left,
    cb: (mouseDownEvent) => {
      const start = positionFromEvent(mouseDownEvent);

      const childSize = childNode.getBoundingClientRect();

      const style = getWindow().getComputedStyle(elementNode);
      const matrix = new DOMMatrixReadOnly(style.transform);

      const size = elementNode.getBoundingClientRect();
      let maxWidth = (size.right - childSize.left) / zoomRef.current;
      if (resizedMaxWidth && resizedMaxWidth < maxWidth) maxWidth = resizedMaxWidth;

      onStartResizing();

      return onMouseMove((mouseMoveEvent: MouseEvent) => {
        const current = positionFromEvent(mouseMoveEvent);

        const diff = {
          x: current.clientX - start.clientX,
          y: current.clientY - start.clientY,
        };

        let nextWidth = size.width / zoomRef.current - diff.x / zoomRef.current;
        if (resizedMinWidth && nextWidth < resizedMinWidth) {
          diff.x += (nextWidth - resizedMinWidth) * zoomRef.current;
          nextWidth = resizedMinWidth;
        }
        if (nextWidth > maxWidth) {
          diff.x += (nextWidth - maxWidth) * zoomRef.current;
          nextWidth = maxWidth;
        }

        elementNode.style.width = `${nextWidth}px`;

        const position = produceElementPosition({
          elementNode,
          childNode,
          x: matrix.e + diff.x / zoomRef.current,
          y: matrix.f,
          zoom: zoomRef.current,
        });

        if (resizedMinWidth && nextWidth < resizedMinWidth) {
          position.x = matrix.e + (size.width / zoomRef.current) - resizedMinWidth;
        }

        elementNode.style.transform = produceStyle({ position });
        elementsRef.current[id].position = position;
      });
    },
    onAfterResize,
    updateZIndex,
  });

  elementNode.appendChild(left);

  return () => {
    elementNode.removeChild(left);
  };
};

const createRightResizer: Resizer = ({
  childNode,
  className,
  elementNode,
  elementsRef,
  id,
  onAfterResize,
  onStartResizing,
  resizedMaxWidth,
  resizedMinWidth,
  resizerWidth,
  updateZIndex,
  zoomRef,
}) => {
  const right = createResizerNode();
  right.style.right = '0px';
  right.style.top = '0px';
  right.style.width = getResizerWidth(resizerWidth);
  right.style.height = '100%';
  right.style.cursor = 'e-resize';

  handleResizeEvent({
    className,
    elementNode,
    resizerNode: right,
    cb: (mouseDownEvent) => {
      const start = positionFromEvent(mouseDownEvent);
      const size = elementNode.getBoundingClientRect();
      const childSize = childNode.getBoundingClientRect();
      let maxWidth = (childSize.right - size.left) / zoomRef.current;
      if (resizedMaxWidth && resizedMaxWidth < maxWidth) maxWidth = resizedMaxWidth;

      onStartResizing();

      return onMouseMove((mouseMoveEvent: MouseEvent) => {
        const current = positionFromEvent(mouseMoveEvent);

        const diff = {
          x: current.clientX - start.clientX,
          y: current.clientY - start.clientY,
        };

        let nextWidth = size.width / zoomRef.current + diff.x / zoomRef.current;
        if (resizedMinWidth && nextWidth < resizedMinWidth) {
          elementNode.style.width = `${resizedMinWidth}px`;
          return;
        }
        if (nextWidth > maxWidth) nextWidth = maxWidth;
        elementNode.style.width = `${nextWidth}px`;

        const position = produceElementPosition({
          elementNode,
          childNode,
          x: (size.x - childSize.x) / zoomRef.current,
          y: (size.y - childSize.y) / zoomRef.current,
          zoom: zoomRef.current,
        });

        elementNode.style.transform = produceStyle({ position });
        elementsRef.current[id].position = position;
      });
    },
    onAfterResize,
    updateZIndex,
  });

  elementNode.appendChild(right);

  return () => {
    elementNode.removeChild(right);
  };
};

const useElementResize: UseElementResize = (elementNode, options) => {
  const { childNode, className, zoomRef } = usePanZoom();
  const { elementsRef } = useElements();
  const resizingClassName = `${className}--element-resizing`;

  const onAfterResizeRef = useRef<ElementOnAfterResize>();
  onAfterResizeRef.current = options.onAfterResize;

  const onStartResizingRef = useRef<ElementOnStartResizing>();
  onStartResizingRef.current = options.onStartResizing;

  useEffect(() => {
    if (options.disabled || !options.resizable) return undefined;

    const resizedMinWidth = options.resizedMinWidth || ELEMENT_RESIZED_MIN_WIDTH;
    const resizerWidth = options.resizerWidth || ELEMENT_RESIZER_WIDTH;

    const onStartResizing = () => {
      actionsClassList.add(childNode, resizingClassName);

      if (!onStartResizingRef.current) return;

      onStartResizingRef.current({
        id: options.id,
      });
    };

    const onAfterResize = () => {
      actionsClassList.remove(childNode, resizingClassName);

      if (!onAfterResizeRef.current) return;

      onAfterResizeRef.current({
        id: options.id,
      });
    };

    const leftNodeClear = createLeftResizer({
      childNode,
      elementNode,
      elementsRef,
      ...options,
      onAfterResize,
      onStartResizing,
      resizedMinWidth,
      resizerWidth,
      zoomRef,
    });

    const rightNodeClear = createRightResizer({
      childNode,
      elementNode,
      elementsRef,
      ...options,
      onAfterResize,
      onStartResizing,
      resizedMinWidth,
      resizerWidth,
      zoomRef,
    });

    return () => {
      leftNodeClear();
      rightNodeClear();
    };
  }, [
    resizingClassName,
    options.className,
    options.disabled,
    options.resizable,
    options.resizedMaxWidth,
    options.resizedMinWidth,
    options.resizerWidth,
    options.updateZIndex,
  ]);
};

export default useElementResize;
