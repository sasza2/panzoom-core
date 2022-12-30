type Edge = string | number;

export type Boundary = {
  top?: Edge;
  right?: Edge;
  bottom?: Edge;
  left?: Edge;
};

export type BoundaryProp = Boundary | boolean;

export type Position = {
  x: number;
  y: number;
};

export type Size = {
  height?: string | number;
  width?: string | number;
};

export type OnElementsChange = (elements: Record<string, Position>) => unknown;

type OnContainerChange = ({ position, zoom }: { position: Position; zoom: number }) => unknown;

type OnContainerClick = (
  click: {
    e: MouseEvent;
    stop: () => unknown;
  } & Position
) => unknown;

export type Zoom = Ref<number>;

export type ZoomEvent = {
  deltaY: number;
  clientX: number;
  clientY: number;
};

export type PanZoomOptions = {
  boundary?: BoundaryProp;
  className?: string;
  disabled?: boolean;
  disabledElements?: boolean;
  disabledMove?: boolean;
  disabledUserSelect?: boolean;
  disabledZoom?: boolean;
  onElementsChange?: OnElementsChange;
  onContainerChange?: OnContainerChange;
  onContainerClick?: OnContainerClick,
  onContainerPositionChange?: OnContainerChange;
  onContainerZoomChange?: OnContainerChange;
  selecting?: boolean;
  zoomInitial?: number;
  zoomMax?: number;
  zoomMin?: number;
  zoomSpeed?: number;
} & Size

export type Ref <T> = { current: T | undefined }

export type PanZoomContext = {
  boundary?: BoundaryProp,
  className?: string;
  blockMovingRef: Ref<boolean>,
  childNode: HTMLDivElement,
  containerNode: HTMLDivElement,
  disabled: boolean,
  disabledElements: boolean,
  disabledMove: boolean,
  disabledUserSelect: boolean,
  disabledZoom: boolean,
  onContainerChangeRef: Ref<OnContainerChange>,
  onContainerClickRef: Ref<OnContainerClick>,
  onContainerPositionChangeRef: Ref<OnContainerChange>,
  onContainerZoomChangeRef: Ref<OnContainerChange>,
  onElementsChangeRef: Ref<OnElementsChange>,
  positionRef: Ref<Position>,
  selecting: boolean,
  zoomRef: Zoom,
  zoomInitial?: number;
  zoomMax?: number;
  zoomMin?: number;
  zoomSpeed?: number;
} & Size

export type ClientPosition = {
  clientX: number;
  clientY: number;
};

export type Elements = Ref<Record<ElementId, Element>>;

export type ElementsInMove = Record<ElementId, Position>;

export type ElementsContext = {
  elementsInMove: ElementsInMove;
  elementsRef: Elements;
  lastElementMouseMoveEventRef: Ref<ClientPosition>;
  setElementsInMove: (elementsInMove: ElementsInMove) => void;
};

export type ElementId = string | number;

export type Element = {
  family?: string;
  id: ElementId;
  node: Ref<HTMLDivElement>;
  position: Position;
};

type ElementOnClick = (
  props: {
    id: ElementId;
    family?: string;
    e: MouseEvent;
    stop: () => void;
  } & Position
) => unknown;

type ElementOnMouseUp = (
  props: {
    id: ElementId;
    family?: string;
    e: MouseEvent;
  } & Position
) => unknown;

export type ElementOptions = {
  className?: string;
  disabled?: boolean;
  draggableSelector?: string;
  family?: string;
  followers?: Array<ElementId>;
  id: ElementId;
  onClick?: ElementOnClick;
  onMouseUp?: ElementOnMouseUp;
  x?: number;
  y?: number;
};

export type PanZoomApi = {
  addElement: (node: HTMLDivElement, elementOptions: ElementOptions) => ElementApi,
  destroy: () => void,
  setOptions: (options: PanZoomOptions) => void,
}

export type ElementApi = {
  destroy: () => void,
  setOptions: (options: ElementOptions) => void,
}
