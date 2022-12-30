const applyStyles = (node: HTMLElement, styles: Record<string, string>) => {
  const nodeStyle = node.style as unknown as typeof styles // TODO
  Object.entries(styles).forEach(([key, value]) => {
    nodeStyle[key] = value
  })
}

export default applyStyles
