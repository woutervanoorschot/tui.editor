import { EditorState, Transaction } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import { Schema } from 'prosemirror-model';

import 'prosemirror-commands';

declare module 'prosemirror-commands' {
  export interface Command<S extends Schema = any> {
    (state: EditorState, dispatch?: (tr: Transaction) => void, view?: EditorView): boolean;
  }

  export interface Keymap<S extends Schema = any> {
    [key: string]: Command<S>;
  }
}
