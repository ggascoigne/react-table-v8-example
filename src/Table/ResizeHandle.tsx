import { Header } from '@tanstack/react-table'
import { RowData } from '@tanstack/table-core'
import { ReactElement } from 'react'

import { useStyles } from './TableStyles'

export const ResizeHandle = <T extends RowData>({ header }: { header: Header<T, unknown> }): ReactElement => {
  const { classes, cx } = useStyles()
  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      style={{ cursor: 'col-resize' }} // override the useResizeColumns default
      className={cx({
        [classes.resizeHandle]: true,
        handleActive: header.column.getIsResizing(),
      })}
    />
  )
}
