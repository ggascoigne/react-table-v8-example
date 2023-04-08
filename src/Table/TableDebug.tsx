import BugReportTwoToneIcon from '@mui/icons-material/BugReportTwoTone'
import { IconButton, Tooltip } from '@mui/material'
import { atom, useAtom } from 'jotai'
import React, { Suspense } from 'react'

import { Loader } from '../Loader'

const ReactJson = React.lazy(() => import('react-json-view'))

const debugIsOpen = atom<boolean>(false)
export const useDebugIsOpen = () => useAtom(debugIsOpen)

export const TableDebugButton: React.FC<{ enabled: boolean; instance: any }> = ({ enabled, instance }) => {
  const [, setOpen] = useDebugIsOpen()
  return enabled ? (
    <Tooltip title='Debug'>
      <div style={{ position: 'relative' }}>
        <IconButton
          sx={[
            instance?.rows?.length && {
              marginLeft: '-2px',
              '& svg': {
                width: '1.5rem',
                height: '1.5rem',
              },
            },
          ]}
          onClick={() => setOpen((old) => !old)}
          size='large'
        >
          <BugReportTwoToneIcon />
        </IconButton>
      </div>
    </Tooltip>
  ) : null
}

export const TableDebug: React.FC<{
  enabled: boolean
  instance: any
}> = ({ enabled, instance }) => {
  const [isOpen] = useDebugIsOpen()

  return enabled && isOpen ? (
    <>
      <br />
      <br />
      <Suspense fallback={<Loader />}>
        <ReactJson
          src={{
            headerGroups: instance.getHeaderGroups(),
            rows: instance.getRowModel().rows,
            state: instance.getState(),
          }}
          collapsed={1}
          indentWidth={2}
          enableClipboard={false}
          sortKeys
        />
      </Suspense>
    </>
  ) : null
}
