import applyClassName from '@/helpers/applyClassName';
import applyStyles from '@/helpers/applyStyles';
import produceStyle from '@/helpers/produceStyle';
import { useEffect } from '@/helpers/effects';
import valueToCSSAttribute from '@/helpers/valueToCSSAttribute';
import { usePanZoom } from '@/provider';
import { CLASS_NAME } from './consts';
import { CHILD_DISABLED_STYLE, CHILD_STYLE, CONTAINER_STYLE } from './styles';
import useApi from './hooks/useApi';
import useElementAutoMoveAtEdge from './hooks/useElementAutoMoveAtEdge';
import useMove from './hooks/useMove';
import useZoom from './hooks/useZoom';

const PanZoom = () => {
  const {
    childNode,
    className = CLASS_NAME,
    containerNode,
    disabledUserSelect,
    height,
    positionRef,
    selecting,
    width,
    zoomRef,
  } = usePanZoom();

  useMove();
  useZoom();
  useElementAutoMoveAtEdge();
  useApi();

  useEffect(() => {
    const childStyle = {
      ...CHILD_STYLE,
      height: valueToCSSAttribute(height),
      width: valueToCSSAttribute(width),
      transform: produceStyle({
        position: positionRef.current,
        zoom: zoomRef.current,
      }),
      '--zoom': zoomRef.current.toString(),
    };

    return applyStyles(childNode, childStyle);
  }, [width, height]);

  useEffect(() => {
    childNode.setAttribute('draggable', 'false');
    const removeStyles = applyStyles(containerNode, CONTAINER_STYLE);

    return () => {
      childNode.setAttribute('draggable', null);
      removeStyles();
    };
  }, []);

  useEffect(() => {
    if (!selecting) return undefined;

    childNode.style.pointerEvents = 'all';

    return () => {
      childNode.style.pointerEvents = null;
    };
  }, [selecting]);

  useEffect(() => {
    if (!className) return undefined;

    const removeChildClassName = applyClassName(childNode, `${className}__in`);
    const removeContainerClassName = applyClassName(containerNode, className);

    return () => {
      removeChildClassName();
      removeContainerClassName();
    };
  }, [className]);

  useEffect(() => {
    if (!className || !selecting) return undefined;

    return applyClassName(containerNode, `${className}--selecting`);
  }, [className, selecting]);

  useEffect(() => {
    if (!disabledUserSelect) return undefined;

    const removeClassName = applyClassName(containerNode, `${className}--disabled-user-select`);
    const removeStyles = applyStyles(childNode, CHILD_DISABLED_STYLE);

    return () => {
      removeClassName();
      removeStyles();
    };
  }, [className, disabledUserSelect]);
};

export default PanZoom;
