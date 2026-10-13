import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import StarterKit from '@tiptap/starter-kit';
import Paragraph from '@tiptap/extension-paragraph';
import Heading from '@tiptap/extension-heading';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { ImageResizeExtension } from '@/app/components/editor/extensions/image-resize/index';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import Focus from '@tiptap/extension-focus'; // Focus mode class
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { MathEquationBlock } from '@/app/components/editor/extensions/math-equation';
import { SlashCommand, getSuggestionItems, renderSuggestionItems } from '@/app/components/editor/extensions/slash-command';
import { CodeBlockComponent } from '@/app/components/editor/components/CodeBlockComponent';
import { ReactNodeViewRenderer } from '@tiptap/react';
import Youtube from '@tiptap/extension-youtube';
import { SearchAndReplace } from '@/app/components/editor/extensions/search-and-replace';
import { SmartPaste } from '@/app/components/editor/extensions/smart-paste';
import { DivBlock } from '@/app/components/editor/extensions/div-block';

import CharacterCount from '@tiptap/extension-character-count';

// Create a lowlight instance with common languages
const lowlight = createLowlight(common);

export const editorExtensions = [
  StarterKit.configure({
    heading: false,
    paragraph: false,
    blockquote: false,
    bulletList: false,
    orderedList: false,
    dropcursor: {
      color: '#3b82f6',
      width: 2,
    },
    codeBlock: false,
  }),
  // Enhanced Paragraph with style and class preservation
  Paragraph.extend({
    addAttributes() {
      return {
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
        class: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('class'),
          renderHTML: (attributes) => attributes.class ? { class: attributes.class } : {},
        },
      };
    },
  }),
  // Enhanced Heading with style and class preservation
  Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  }).extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
        class: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('class'),
          renderHTML: (attributes) => attributes.class ? { class: attributes.class } : {},
        },
      };
    },
  }),
  // Custom Div block preserving card containers and styles
  DivBlock,
  Blockquote.extend({
    addAttributes() {
      return {
        class: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('class'),
          renderHTML: (attributes) => {
            if (!attributes.class) return {};
            return { class: attributes.class };
          },
        },
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
      };
    },
  }),
  BulletList.extend({
    addAttributes() {
      return {
        class: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('class'),
          renderHTML: (attributes) => {
            if (!attributes.class) return {};
            return { class: attributes.class };
          },
        },
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
      };
    },
  }),
  OrderedList.extend({
    addAttributes() {
      return {
        class: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('class'),
          renderHTML: (attributes) => {
            if (!attributes.class) return {};
            return { class: attributes.class };
          },
        },
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
      };
    },
  }),
  Underline,
  Link.configure({
    openOnClick: false,
    autolink: true,
  }).extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
      };
    },
  }),
  ImageResizeExtension,
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Placeholder.configure({
    placeholder: ({ node }) => {
      if (node.type.name === 'heading') {
        return 'What’s the title?';
      }
      return 'Tell your story...';
    },
    emptyEditorClass: 'is-editor-empty',
  }),
  Table.configure({
    resizable: true,
  }).extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
      };
    },
  }),
  TableRow.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
      };
    },
  }),
  TableHeader.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
      };
    },
  }),
  TableCell.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
      };
    },
  }),
  CodeBlockLowlight.configure({
    lowlight,
  }).extend({
    addNodeView() {
      return ReactNodeViewRenderer(CodeBlockComponent);
    },
  }),
  Focus.configure({
    className: 'has-focus',
    mode: 'all',
  }),
  TaskList,
  TaskItem.configure({
    nested: true,
  }),
  TextStyle.extend({
    addAttributes() {
      return {
        ...this.parent?.(),
        style: {
          default: null,
          parseHTML: (element: HTMLElement) => element.getAttribute('style'),
          renderHTML: (attributes) => attributes.style ? { style: attributes.style } : {},
        },
      };
    },
  }),
  Color,
  Highlight.configure({
    multicolor: true,
  }),
  Subscript,
  Superscript,
  MathEquationBlock,
  Youtube.configure({
    controls: true,
    nocookie: true,
  }),
  SearchAndReplace,
  SmartPaste,

  CharacterCount.configure({
    mode: 'textSize', // This ensures it counts text accurately
  }),
  SlashCommand.configure({
    suggestion: {
      items: getSuggestionItems,
      render: renderSuggestionItems,
    },
  }),
];
