import { rankItem } from '@tanstack/match-sorter-utils'
import { FilterFn } from '@tanstack/react-table'

export const fuzzyTextFilter: FilterFn<any> = (row, columnId, value, addMeta) => {
  // Rank the item
  const itemRank = rankItem(row.getValue(columnId), value)

  // Store the ranking info
  addMeta(itemRank)

  // Return if the item should be filtered in/out
  return itemRank.passed
}

// Let the table remove the filter if the string is empty
fuzzyTextFilter.autoRemove = (val: any) => !val
