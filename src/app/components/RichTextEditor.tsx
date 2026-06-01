'use client';

import { useCallback, useEffect, useRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import {
  $getRoot,
  $getSelection,
  $isRangeSelection,
  $insertNodes,
  $createParagraphNode,
  FORMAT_TEXT_COMMAND,
  type EditorState,
  type LexicalEditor,
} from 'lexical';
import { HeadingNode, QuoteNode, $createHeadingNode } from '@lexical/rich-text';
import {
  ListNode,
  ListItemNode,
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { LinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
import { $setBlocksType } from '@lexical/selection';

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const theme = {
  paragraph: 'mb-1',
  heading: { h1: 'text-xl font-bold mb-1', h2: 'text-lg font-bold mb-1', h3: 'text-base font-bold mb-1' },
  list: { ul: 'list-disc ml-6 mb-1', ol: 'list-decimal ml-6 mb-1', listitem: 'mb-0.5' },
  link: 'text-accent underline',
  text: { bold: 'font-bold', italic: 'italic', underline: 'underline' },
};

// Load the initial HTML into the editor exactly once.
function InitialHtmlPlugin({ html }: { html: string }) {
  const [editor] = useLexicalComposerContext();
  const loaded = useRef(false);
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    editor.update(() => {
      const root = $getRoot();
      root.clear();
      if (html && html.trim()) {
        const dom = new DOMParser().parseFromString(html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        root.select();
        $insertNodes(nodes);
      }
    });
  }, [editor, html]);
  return null;
}

function Toolbar() {
  const [editor] = useLexicalComposerContext();
  const btn = 'rounded px-2 py-1 text-sm text-gray-700 hover:bg-gray-100';

  const setHeading = () =>
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createHeadingNode('h2'));
    });
  const setParagraph = () =>
    editor.update(() => {
      const sel = $getSelection();
      if ($isRangeSelection(sel)) $setBlocksType(sel, () => $createParagraphNode());
    });
  const insertLink = () => {
    const url = window.prompt('Link URL');
    if (url) editor.dispatchCommand(TOGGLE_LINK_COMMAND, url);
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 p-1">
      <button type="button" title="Bold" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')} className={btn}><b>B</b></button>
      <button type="button" title="Italic" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')} className={btn}><i>I</i></button>
      <button type="button" title="Underline" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')} className={btn}><u>U</u></button>
      <span className="mx-1 h-5 w-px bg-gray-200" />
      <button type="button" title="Heading" onClick={setHeading} className={btn}>H</button>
      <button type="button" title="Paragraph" onClick={setParagraph} className={btn}>¶</button>
      <span className="mx-1 h-5 w-px bg-gray-200" />
      <button type="button" title="Bullet list" onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)} className={btn}>• List</button>
      <button type="button" title="Numbered list" onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)} className={btn}>1. List</button>
      <button type="button" title="Insert link" onClick={insertLink} className={btn}>🔗</button>
    </div>
  );
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Add a more detailed description...',
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const handleChange = useCallback((editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const html = $generateHtmlFromNodes(editor, null);
      onChangeRef.current(html);
    });
  }, []);

  const initialConfig = {
    namespace: 'DaybreakEditor',
    theme,
    onError: (error: Error) => console.error('Lexical error:', error),
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
  };

  return (
    <div className="mt-2 overflow-hidden rounded-md border border-gray-200 bg-white">
      <LexicalComposer initialConfig={initialConfig}>
        <Toolbar />
        <div className="relative">
          <RichTextPlugin
            contentEditable={<ContentEditable className="min-h-[140px] px-3 py-2 text-sm outline-none" />}
            placeholder={
              <div className="pointer-events-none absolute left-3 top-2 text-sm text-gray-400">
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <OnChangePlugin onChange={handleChange} />
          <InitialHtmlPlugin html={value} />
        </div>
      </LexicalComposer>
    </div>
  );
}
