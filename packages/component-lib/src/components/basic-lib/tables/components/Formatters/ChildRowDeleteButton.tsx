import styled from '@emotion/styled'
import { useFocusRef } from '../../hook'

const ChildRowActionCrossClassname = styled.div`
  &::before,
  &::after {
    content: '';
    position: absolute;
    background: grey;
  }

  &::before {
    left: 21px;
    width: 1px;
    height: 100%;
  }

  &::after {
    top: 50%;
    left: 20px;
    height: 1px;
    width: 15px;
  }

  &:hover {
    background: red;
  }
`

const ChildRowButtonClassname = styled.div`
  cursor: pointer;
  position: absolute;
  left: 21px;
  transform: translateX(-50%);
  filter: grayscale(1);
`

interface ChildRowDeleteButtonProps {
  isCellSelected: boolean
  isDeleteSubRowEnabled: boolean
  onDeleteSubRow: () => void
}

export function ChildRowDeleteButton({
  isCellSelected,
  onDeleteSubRow,
  isDeleteSubRowEnabled,
}: ChildRowDeleteButtonProps) {
  const iconRef = useFocusRef<HTMLSpanElement>(isCellSelected)

  function handleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      onDeleteSubRow()
    }
  }

  return (
    <>
      <ChildRowActionCrossClassname />
      {isDeleteSubRowEnabled && (
        <ChildRowButtonClassname onClick={onDeleteSubRow}>
          <span ref={iconRef} tabIndex={-1} onKeyDown={handleKeyDown}>
            ❌
          </span>
        </ChildRowButtonClassname>
      )}
    </>
  )
}
