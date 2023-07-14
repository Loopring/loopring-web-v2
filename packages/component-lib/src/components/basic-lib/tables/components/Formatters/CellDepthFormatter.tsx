import clsx from 'clsx'
import styled from '@emotion/styled'
import { withTranslation, WithTranslation } from 'react-i18next'
import { CellRendererProps } from 'react-data-grid'

const StyleDepth = styled.div`
  position: absolute;
  right: 0;
  height: 100%;
  z-index: -1;
  opacity: 0.06;

  .rgb-depth-cell {
    width: 100%;
    background: var(--color-success);

    &.rgb-depth-red {
      background: var(--color-error);
      //background: ${({ theme, style }) =>
        theme.colorBase[style === 'good' ? 'success' : 'error']};;
    }
  }
`

interface IDepthRendererProps<R, SR> extends CellRendererProps<R, SR> {
  depthKey: string
}

export const CellDepthFormatter = <R, SR>({
  t,
  row,
  column,
  className,
  depthKey,
  ...props
}: WithTranslation & IDepthRendererProps<R, SR>) => {
  className = clsx(className, { 'rgb-depth-cell': true })
  const style = { width: `${Number((row as any)[depthKey]) * 100}%` }
  return (
    <StyleDepth {...props}>
      <div className={className} style={style}></div>
    </StyleDepth>
  )
}
export default withTranslation()(CellDepthFormatter)
