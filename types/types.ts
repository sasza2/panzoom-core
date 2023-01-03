export type Boundary = {
  top?: Edge;
  right?: Edge;
  bottom?: Edge;
  left?: Edge;
};

export type BoundaryProp = Boundary | boolean;

export type ClientPosition = {
  clientX: number;
  clientY: number;
};

type Edge = string | number;

export type Position = {
  x: number;
  y: number;
};

export type Size = {
  height?: string | number;
  width?: string | number;
};

export type Ref <T> = { current: T | undefined }

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
  clientX: number;
  clientY: number;
  deltaY: number;
  hasTouches: boolean,
};

export type API = {
  childNode: HTMLDivElement,
  move: (x: number, y: number) => void;
  getElements: () => Elements['current'];
  updateElementPosition: (id: string | number, position: Position) => void;
  getPosition: () => Position;
  setPosition: (x: number, y: number) => void;
  getZoom: () => number;
  setZoom: (zoom: number) => void;
  zoomIn: (zoom: number) => void;
  zoomOut: (zoom: number) => void;
  reset: () => void;
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

export type PanZoomContext = {
  apiRef: Ref<API>,
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

export type ElementId = string | number;

export type Elements = Ref<Record<ElementId, Element>>;

export type ElementsInMove = Record<ElementId, Position>;

export type ElementsContext = {
  elementsRef: Elements;
  lastElementMouseMoveEventRef: Ref<ClientPosition>;
};

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
} & API

export type ElementApi = {
  destroy: () => void,
  setOptions: (options: ElementOptions) => void,
}
