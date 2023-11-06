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

export type Edge = string | number;

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

type OnContextMenu = (
  click: {
    e: MouseEvent;
  } & Position
) => unknown;


export type Zoom = Ref<number>;

export type ZoomEvent = {
  clientX: number;
  clientY: number;
  deltaY: number;
  isTouchEvent: boolean,
};

export type API = {
  childNode: HTMLDivElement,
  move: (x: number, y: number) => void;
  getElements: () => Elements['current'];
  getElementsInMove: () => ElementsInMove,
  grabElement: (id: ElementId, position?: Position) => null | (() => void);
  updateElementPosition: (id: ElementId, position: Position) => void;
  updateElementPositionSilent: (id: ElementId, position: Position) => void;
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
  disabledScrollHorizontal?: boolean;
  disabledScrollVertical?: boolean;
  disabledUserSelect?: boolean;
  disabledZoom?: boolean;
  elementsAutoMoveAtEdge?: boolean;
  onContextMenu?: OnContextMenu;
  onElementsChange?: OnElementsChange;
  onContainerChange?: OnContainerChange;
  onContainerClick?: OnContainerClick,
  onContainerPositionChange?: OnContainerChange;
  onContainerZoomChange?: OnContainerChange;
  selecting?: boolean;
  scrollSpeed?: number;
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
  disabledScrollHorizontal: boolean;
  disabledScrollVertical: boolean;
  disabledUserSelect: boolean,
  disabledZoom: boolean,
  elementsAutoMoveAtEdge: boolean,
  onContainerChangeRef: Ref<OnContainerChange>,
  onContainerClickRef: Ref<OnContainerClick>,
  onContainerPositionChangeRef: Ref<OnContainerChange>,
  onContainerZoomChangeRef: Ref<OnContainerChange>,
  onContextMenuRef: Ref<OnContextMenu>,
  onElementsChangeRef: Ref<OnElementsChange>,
  positionRef: Ref<Position>,
  selecting: boolean,
  scrollSpeed: number,
  zoomRef: Zoom,
  zoomInitial?: number;
  zoomMax?: number;
  zoomMin?: number;
  zoomSpeed?: number;
} & Size

export type ElementId = string | number;

export type Elements = Ref<Record<ElementId, Element>>;

export type ElementsInMove = Record<ElementId, Position>;

export type ElementsUpdatePositionApi = Record<ElementId, (elementsInMove: ElementsInMove) => void>

export type ElementsContext = {
  elementsInMoveRef: Ref<ElementsInMove>;
  elementsUpdatePositionApiRef: Ref<ElementsUpdatePositionApi>,
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

type ElementOnContextMenu = (
  props: {
    id: ElementId;
    family?: string;
    e: MouseEvent;
  } & Position
) => unknown;

type ElementOnMouseUp = (
  props: {
    id: ElementId;
    family?: string;
    e: MouseEvent;
  } & Position
) => unknown;

export type ElementOnStartResizing = (
  props: {
    id: ElementId;
  }
) => unknown;

export type ElementOnAfterResize = (
  props: {
    id: ElementId;
  }
) => unknown;

export type ElementResizeOptions = {
  className?: string;
  disabled?: boolean;
  id: ElementId;
  onStartResizing?: ElementOnStartResizing;
  onAfterResize?: ElementOnAfterResize;
  resizable?: boolean;
  resizedMaxWidth?: number;
  resizedMinWidth?: number;
  resizerWidth?: number;
}

export type ElementOptions = {
  className?: string;
  disabled?: boolean;
  draggableSelector?: string;
  family?: string;
  followers?: Array<ElementId>;
  height?: number;
  id: ElementId;
  onClick?: ElementOnClick;
  onContextMenu?: ElementOnContextMenu;
  onMouseUp?: ElementOnMouseUp;
  x?: number;
  y?: number;
  width?: number;
} & ElementResizeOptions;

export type PanZoomApi = {
  addElement: (node: HTMLDivElement, elementOptions: ElementOptions) => ElementApi,
  destroy: () => void,
  setOptions: (options: PanZoomOptions) => void,
} & API

export type ElementApi = {
  destroy: () => void,
  setOptions: (options: ElementOptions) => void,
}
