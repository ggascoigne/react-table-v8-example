import React, { CSSProperties, useRef, useState } from 'react'

import { Tooltip } from '@mui/material'
import { CellContext, RowData } from '@tanstack/table-core'

interface TooltipCellProps {
  text: string
  tooltip?: string
  align: string
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

export const TooltipCell: React.FC<TooltipCellProps> = ({ text = '', tooltip = text || '', align, onClick }) => {
  const [isOverflowed, setIsOverflow] = useState(false)
  const textRef = useRef<HTMLSpanElement>(null)

  const compareSize = () => {
    setIsOverflow(!!(textRef?.current && textRef.current?.scrollWidth > textRef.current?.clientWidth))
  }

  const showTooltip = text !== tooltip || isOverflowed

  return (
    <Tooltip
      sx={{
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
      style={{ textAlign: align, width: '100%' } as CSSProperties}
      title={tooltip}
      disableHoverListener={!showTooltip}
    >
      <span ref={textRef} onMouseEnter={compareSize} onClick={onClick}>
        {text}
      </span>
    </Tooltip>
  )
}

export const TooltipCellRenderer = <T extends RowData>(props: CellContext<T, unknown>) => {
  const { cell, column } = props
  const { align = 'left' } = column.columnDef.meta ?? {}
  return <TooltipCell text={cell.getValue() as string} align={align} />
}
