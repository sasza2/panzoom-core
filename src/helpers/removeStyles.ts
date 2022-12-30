const removeStyles = (node: HTMLElement, styles: Record<string, string>) => {
  const nodeStyle = node.style as unknown as typeof styles // TODO
  Object.keys(styles).forEach((key) => {
    nodeStyle[key] = null
  })
}

export default removeStyles
