import { 
  $getRoot, 
  LexicalEditor,
  $insertNodes
} from "lexical"
import { 
  $generateHtmlFromNodes,
  $generateNodesFromDOM 
} from "@lexical/html"
import { $convertToMarkdownString, TRANSFORMERS } from "@lexical/markdown"

export const getEditorStateAsJSON = async (editor: LexicalEditor): Promise<string> => {
  return new Promise(resolve => {
    editor.getEditorState().read(() => {
      const root = $getRoot()
      const json = JSON.stringify(root.exportJSON())
      resolve(json)
    })
  })
}

export const getEditorStateAsHTML = async (editor: LexicalEditor): Promise<string> => {
  return new Promise(resolve => {
    editor.getEditorState().read(() => {
      const html = $generateHtmlFromNodes(editor, null)
      resolve(html)
    })
  })
}

export const getEditorStateAsMarkdown = async (editor: LexicalEditor): Promise<string> => {
  return new Promise(resolve => {
    editor.getEditorState().read(() => {
      const markdown = $convertToMarkdownString(TRANSFORMERS)
      resolve(markdown)
    })
  })
}

export const markdownToEditorState = async (editor: LexicalEditor, markdown: string) => {
  return new Promise(resolve => {
    const parsedState = editor.parseEditorState(markdown)
    resolve(parsedState)
  })
}

export const importContent = async (editor: LexicalEditor, content: string) => {
  try {
    const parsedState = editor.parseEditorState(content)
    editor.setEditorState(parsedState)
  } catch {
    // fall through
  }

  try {
    const markdown = $convertToMarkdownString(TRANSFORMERS)
    const parsedState = editor.parseEditorState(markdown)
    editor.setEditorState(parsedState)
  } catch {
    // fall through
  }

  try {
    const dom = new DOMParser().parseFromString(content, "text/html")
    editor.update(() => {
      const root = $getRoot()
      root.clear()
      root.select()
      const nodes = $generateNodesFromDOM(editor, dom)
      $insertNodes(nodes)
    })
  } catch {
    // If import fails, keep editor as-is
  }
}