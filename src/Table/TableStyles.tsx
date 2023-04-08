import { Checkbox, Theme, styled, useTheme } from '@mui/material'
import MuiTableTable from '@mui/material/Table'
import { TableTypeMap } from '@mui/material/Table/Table'
import MuiTableBody from '@mui/material/TableBody'
import { TableBodyTypeMap } from '@mui/material/TableBody/TableBody'
import MuiTableCell from '@mui/material/TableCell'
import { TableCellProps } from '@mui/material/TableCell/TableCell'
import MuiTableHead from '@mui/material/TableHead'
import { TableHeadTypeMap } from '@mui/material/TableHead/TableHead'
import MuiTableRow from '@mui/material/TableRow'
import { TableRowTypeMap } from '@mui/material/TableRow/TableRow'
import React, { CSSProperties, ReactElement, useCallback } from 'react'
import { SxProps, css } from '@mui/material/styles'
import { css as emotionCss } from '@emotion/css'
import { Header, RowData } from '@tanstack/table-core'
import classnames from 'classnames'

const localStyles = {
  resizeHandle: (theme: Theme) => ({
    position: 'absolute',
    cursor: 'col-resize',
    zIndex: 100,
    opacity: 0,
    borderLeft: `1px solid ${theme.palette.primary.light}`,
    borderRight: `1px solid ${theme.palette.primary.light}`,
    height: '50%',
    top: '25%',
    transition: 'all linear 100ms',
    right: '-2px',
    width: '3px',
    '&.handleActive': {
      opacity: 1,
      border: 'none',
      backgroundColor: theme.palette.primary.light,
      height: 'calc(100% - 4px)',
      top: '2px',
      right: '-1px',
      width: '1px',
    },
  }),
}

const useStyleToClassName = <T extends Record<string, any>>(styles: T) => {
  const theme = useTheme()
  return useCallback(
    (styleName: keyof T) => {
      const className = css(styles[styleName](theme))
      return emotionCss(className.styles)
    },
    [styles, theme]
  )
}

const useResizeHandle = () => {
  const convertStyleToClassName = useStyleToClassName(localStyles)
  return convertStyleToClassName('resizeHandle')
}

interface CN {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
  sx?: SxProps<Theme>
}

export const TableTable: React.FC<Partial<TableTypeMap> & CN> = ({ children, sx, ...rest }) => (
  <MuiTableTable
    component='div'
    sx={[
      {
        borderSpacing: 0,
        border: '1px solid rgba(224, 224, 224, 1)',
        width: '100%',
        flex: '1 1 auto',
        display: 'flex',
        flexDirection: 'column',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...rest}
  >
    {children}
  </MuiTableTable>
)

export const TableBody: React.FC<Partial<TableBodyTypeMap> & CN> = ({ children, sx, ...rest }) => (
  <MuiTableBody
    component='div'
    role='table'
    sx={[
      {
        width: '100%',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...rest}
  >
    {children}
  </MuiTableBody>
)

export const TableHead: React.FC<Partial<TableHeadTypeMap> & CN> = ({ children, sx, ...rest }) => (
  <MuiTableHead
    component='div'
    role='rowgroup'
    sx={[
      { width: '100%', flex: '1 1 auto', display: 'flex', flexDirection: 'column' },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...rest}
  >
    {children}
  </MuiTableHead>
)

export const TableHeadRow: React.FC<Partial<TableRowTypeMap> & CN> = ({ children, sx, ...rest }) => {
  const resizeHandleClassName = useResizeHandle()

  return (
    <MuiTableRow
      component='div'
      role='row'
      sx={[
        (theme) => ({
          outline: 0,
          verticalAlign: 'middle',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderBottom: '1px solid rgba(224, 224, 224, 1)',
          [`&:hover .${resizeHandleClassName}`]: {
            opacity: 1,
          },
          flexDirection: 'row',
          flex: '1 1 auto',
          display: 'flex',
          width: '100%',
        }),
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      {...rest}
    >
      {children}
    </MuiTableRow>
  )
}

export const TableHeadCell: React.FC<Partial<TableCellProps> & CN> = ({ children, sx, ...rest }) => (
  <MuiTableCell
    component='div'
    role='columnheader'
    sx={[
      (theme) => ({
        fontSize: '0.875rem',
        verticalAlign: 'inherit',
        color: theme.palette.text.primary,
        fontWeight: 500,
        lineHeight: '1.5rem',
        borderRight: '1px solid rgba(224, 224, 224, 1)',
        '&:last-child': {
          borderRight: 'none',
        },
        display: 'flex',
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...rest}
  >
    {children}
  </MuiTableCell>
)

export const TableRow: React.FC<Partial<TableRowTypeMap> & CN> = ({ children, sx, ...rest }) => (
  <MuiTableRow
    component='div'
    role='row'
    sx={[
      {
        color: 'inherit',
        outline: 0,
        verticalAlign: 'middle',
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.07)',
        },
        borderBottom: '1px solid rgba(224, 224, 224, 1)',
        '&:last-child': {
          borderBottom: 'none',
        },
        '&.rowSelected': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.07)',
          },
        },
        '&.clickable': {
          cursor: 'pointer',
        },
        flexDirection: 'row',
        flex: '1 1 auto',
        display: 'flex',
        width: '100%',
      },
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...rest}
  >
    {children}
  </MuiTableRow>
)

export const TableCell: React.FC<Partial<TableCellProps> & CN> = ({ children, sx, ...rest }) => (
  <MuiTableCell
    component='div'
    role='cell'
    sx={[
      (theme) => ({
        padding: '8px 16px',
        fontSize: '0.875rem',
        textAlign: 'left',
        fontWeight: 300,
        lineHeight: 1.3,
        verticalAlign: 'inherit',
        color: theme.palette.text.primary,
        borderRight: '1px solid rgba(224, 224, 224, 1)',
        '&:last-child': {
          borderRight: 'none',
        },
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.07)',
        },
        display: 'flex',
      }),
      ...(Array.isArray(sx) ? sx : [sx]),
    ]}
    {...rest}
  >
    {children}
  </MuiTableCell>
)

export const TableLabel: React.FC<CN> = ({ children, ...rest }) => <div {...rest}>{children}</div>

const areEqual = (prevProps: any, nextProps: any) =>
  prevProps.checked === nextProps.checked && prevProps.indeterminate === nextProps.indeterminate

export const HeaderCheckbox = React.memo(
  styled(Checkbox)({
    fontSize: '1rem',
    margin: '-8px 0 -8px -15px',
    padding: '8px 9px',
    '& svg': {
      width: '24px',
      height: '24px',
    },
    '&:hover': {
      backgroundColor: 'transparent',
    },
  }),
  areEqual
)

export const RowCheckbox = React.memo(
  styled(Checkbox)({
    fontSize: '14px',
    margin: '-9px 0 -8px -15px',
    padding: '5px 9px',
    '&:hover': {
      backgroundColor: 'transparent',
    },
    '& svg': {
      width: 24,
      height: 24,
    },
  }),
  areEqual
)

export const ResizeHandle = <T extends RowData>({ header }: { header: Header<T, unknown> }): ReactElement => {
  const resizeHandleClassName = useResizeHandle()
  return (
    <div
      onMouseDown={header.getResizeHandler()}
      onTouchStart={header.getResizeHandler()}
      style={{ cursor: 'col-resize' }} // override the useResizeColumns default
      className={classnames({
        [resizeHandleClassName]: true,
        handleActive: header.column.getIsResizing(),
      })}
    />
  )
}
