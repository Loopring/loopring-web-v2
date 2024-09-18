export const marginLevelTypeToColor = (type: 'safe' | 'warning' | 'danger') => {
  return type === 'safe'
    ? 'var(--color-success)'
    : type === 'warning'
    ? 'var(--color-warning)'
    : 'var(--color-error)'
}
