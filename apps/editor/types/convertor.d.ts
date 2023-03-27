import { NodeType, MarkType, Schema, Node, Mark } from 'prosemirror-model';
import { MdNode, MdNodeType, RendererOptions, HTMLToken, MdPos } from './toastmark';
import { WwNodeType, WwMarkType } from './wysiwyg';

export type Attrs = { [name: string]: any } | null;

export interface StackItem {
  type: NodeType;
  attrs: Attrs | null;
  content: Node[];
}

export interface ToWwConvertorState {
  schema: Schema;
  top(): StackItem;
  push(node: Node): void;
  addText(text: string): void;
  openMark(mark: Mark): void;
  closeMark(mark: MarkType): void;
  addNode(type: NodeType, attrs?: Attrs, content?: Node[]): Node | null;
  openNode(type: NodeType, attrs?: Attrs): void;
  closeNode(): Node | null;
  convertNode(mdNode: MdNode, infoForPosSync: InfoForPosSync): Node | null;
  convertByDOMParser(root: HTMLElement): void;
}

type ToWwConvertor = (
  state: ToWwConvertorState,
  node: MdNode,
  context: {
    entering: boolean;
    skipChildren: () => void;
    leaf: boolean;
    options: Omit<RendererOptions, 'convertors'>;
    getChildrenText: (mdNode: MdNode) => string;
    origin?: () => HTMLToken | HTMLToken[] | null;
  },
  customAttrs?: { htmlAttrs?: Record<string, any>; classNames?: string[] }
) => void;

export type ToWwConvertorMap = Partial<Record<string, ToWwConvertor>>;

export type FirstDelimFn = (index: number) => string;

export interface ToMdConvertorState {
  stopNewline: boolean;
  inTable: boolean;
  getDelim(): string;
  setDelim(delim: string): void;
  flushClose(size?: number): void;
  wrapBlock(delim: string, firstDelim: string | null, node: Node, fn: () => void): void;
  ensureNewLine(): void;
  write(content?: string): void;
  closeBlock(node: Node): void;
  text(text: string, escaped?: boolean): void;
  convertBlock(node: Node, parent: Node, index: number): void;
  convertInline(parent: Node): void;
  convertList(node: Node, delim: string, firstDelimFn: FirstDelimFn): void;
  convertTableCell(node: Node): void;
  convertNode(parent: Node, infoForPosSync?: InfoForPosSync): string;
}

export interface ToDOMAdaptor {
  getToDOMNode(type: string): ((node: Node | Mark) => Node) | null;
}

type HTMLToWwConvertor = (state: ToWwConvertorState, node: MdNode, openTagName: string) => void;

export type HTMLToWwConvertorMap = Partial<Record<string, HTMLToWwConvertor>>;

export interface FlattenHTMLToWwConvertorMap {
  [k: string]: HTMLToWwConvertor;
}

export interface NodeInfo {
  node: Node;
  parent?: Node;
  index?: number;
}

export interface MarkInfo {
  node: Mark;
  parent?: Node;
  index?: number;
}

interface ToMdConvertorReturnValues {
  delim?: string | string[];
  rawHTML?: string | string[] | null;
  text?: string;
  attrs?: Attrs;
}

type ToMdNodeTypeWriter = (
  state: ToMdConvertorState,
  nodeInfo: NodeInfo,
  params: ToMdConvertorReturnValues
) => void;

export type ToMdNodeTypeWriterMap = Partial<Record<WwNodeType, ToMdNodeTypeWriter>>;

interface ToMdMarkTypeOption {
  mixable?: boolean;
  removedEnclosingWhitespace?: boolean;
  escape?: boolean;
}

export type ToMdMarkTypeOptions = Partial<Record<WwMarkType, ToMdMarkTypeOption | null>>;

type ToMdNodeTypeConvertor = (state: ToMdConvertorState, nodeInfo: NodeInfo) => void;

export type ToMdNodeTypeConvertorMap = Partial<Record<WwNodeType, ToMdNodeTypeConvertor>>;

type ToMdMarkTypeConvertor = (
  nodeInfo?: MarkInfo,
  entering?: boolean
) => ToMdConvertorReturnValues & ToMdMarkTypeOption;

export type ToMdMarkTypeConvertorMap = Partial<Record<WwMarkType, ToMdMarkTypeConvertor>>;

interface ToMdConvertorContext {
  origin?: () => ReturnType<ToMdConvertor>;
  entering?: boolean;
  inTable?: boolean;
}

type ToMdConvertor = (
  nodeInfo: NodeInfo | MarkInfo,
  context: ToMdConvertorContext
) => ToMdConvertorReturnValues;

export type ToMdConvertorMap = Partial<Record<WwNodeType | MdNodeType, ToMdConvertor>>;

export interface ToMdConvertors {
  nodeTypeConvertors: ToMdNodeTypeConvertorMap;
  markTypeConvertors: ToMdMarkTypeConvertorMap;
}

export interface InfoForPosSync {
  node: MdNode | Node | null;
  setMappedPos: (pos: MdPos | number) => void;
}
