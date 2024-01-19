import { DepartmentRow, InvestRowAction, RowInvest, SubRowAction } from '../Interface'
import { InvestColumnKey } from '../index'

function toggleSubRow(rows: RowInvest[], symbol?: string): RowInvest[] {
  if (rows.length) {
    let rowIndex = rows.findIndex((r) => r?.token?.symbol === symbol)
    if (rowIndex === -1) {
      rowIndex = 0
    }
    const row = rows[rowIndex]
    const { children } = row
    if (!children) return rows

    const newRows = [...rows]
    newRows[rowIndex] = { ...row, isExpanded: !row.isExpanded }
    if (!row.isExpanded) {
      // @ts-ignore
      newRows.splice(rowIndex + 1, 0, ...children)
    } else {
      newRows.splice(rowIndex + 1, children.length)
    }
    return newRows
  } else {
    return []
  }
}

function updateRow(_oldRows: RowInvest[], rows: RowInvest[]): RowInvest[] {
  return [...rows]
}

export const sortMethod = (
  sortedRows: any[],
  sortColumn: string,
  _des: 'DESC' | 'ASC' | undefined,
) => {
  let _rawData = [...sortedRows]

  switch (sortColumn) {
    case InvestColumnKey.TYPE:
      _rawData = sortedRows.sort((a, b) => {
        const valueA = a.token.symbol
        const valueB = b.token.symbol
        return valueB.localeCompare(valueA)
      })
      break
    case InvestColumnKey.APR:
      _rawData = sortedRows.sort((a, b) => {
        return Number(b.apr[1] ?? 0) - Number(a.apr[1] ?? 0)
        // myLog("a.apr[1]", a.apr[1]);
      })
      break
    default:
      break
  }
  // resetTableData(_rawData)
  return _rawData
}

export function investRowReducer(
  _rows: DepartmentRow[],
  { type, symbol, rows, sortColumn, _des }: InvestRowAction | any,
): DepartmentRow[] {
  switch (type) {
    case SubRowAction.ToggleSubRow:
      return toggleSubRow(_rows, symbol)
    case SubRowAction.UpdateRaw:
      return updateRow(_rows, rows ?? [])
    case SubRowAction.SortRow:
      return sortMethod(_rows, sortColumn, _des)
    // case "deleteSubRow":
    //   return deleteSubRow(rows, id);
    default:
      return _rows
  }
}
