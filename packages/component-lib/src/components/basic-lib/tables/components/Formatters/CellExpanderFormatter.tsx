import { useLayoutEffect, useRef } from 'react';
import styled from "@emotion/styled";

export function useFocusRef<T extends HTMLOrSVGElement>(isCellSelected: boolean | undefined) {
    const ref = useRef<T>(null);
    useLayoutEffect(() => {
        if (!isCellSelected) return;
        ref.current?.focus({preventScroll: true});
    }, [isCellSelected]);

    return ref;
}

const CellExpandClassname = styled.div`
  float: right;
  display: table;
  height: 100%;

  > span {
    display: table-cell;
    vertical-align: middle;
    cursor: pointer;
  }
`;

interface CellExpanderFormatterProps {
    isCellSelected: boolean;
    expanded: boolean;
    onCellExpand: () => void;
}

export function CellExpanderFormatter({isCellSelected, expanded, onCellExpand}: CellExpanderFormatterProps) {
    const iconRef = useFocusRef<HTMLSpanElement>(isCellSelected);

    function handleClick(e: React.MouseEvent<HTMLSpanElement>) {
        e.stopPropagation();
        onCellExpand();
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLSpanElement>) {
        if (e.key === ' ' || e.key === 'Enter') {
            e.preventDefault();
            onCellExpand();
        }
    }

    return (
        <CellExpandClassname>
      <span
          onClick={handleClick}
          onKeyDown={handleKeyDown}
      >
        <span
            ref={iconRef}
            tabIndex={-1}
        >
          {expanded ? '\u25BC' : '\u25B6'}
        </span>
      </span>
        </CellExpandClassname>
    );
}
