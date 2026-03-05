type BaseLexicalJSON = { root: unknown }

export const isLexicalJSON = (content: unknown) => {
  return !!content && 
    typeof content === "object" && 
    "root" in content
}