import { FilterFn } from '@tanstack/react-table'

const regex = /([=<>!]*)\s*((?:[0-9].?[0-9]*)+)/

function parseValue(filterValue: any) {
  // eslint-disable-next-line eqeqeq
  const defaultComparator = (val: any) => val == filterValue
  const tokens = regex.exec(filterValue)
  if (!tokens) {
    return defaultComparator
  }
  switch (tokens[1]) {
    case '>':
      return (val: any) => parseFloat(val) > parseFloat(tokens[2])
    case '<':
      return (val: any) => parseFloat(val) < parseFloat(tokens[2])
    case '<=':
      return (val: any) => parseFloat(val) <= parseFloat(tokens[2])
    case '>=':
      return (val: any) => parseFloat(val) >= parseFloat(tokens[2])
    case '=':
      return (val: any) => parseFloat(val) === parseFloat(tokens[2])
    case '!':
      return (val: any) => parseFloat(val) !== parseFloat(tokens[2])
  }
  return defaultComparator
}

export const numericTextFilter: FilterFn<any> = (row, columnId, value) => {
  const comparator = parseValue(value)
  return comparator(row.getValue(columnId))
}

// Let the table remove the filter if the string is empty
numericTextFilter.autoRemove = (val: any) => !val
