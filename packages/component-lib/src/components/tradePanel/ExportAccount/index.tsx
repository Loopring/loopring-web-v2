import { ExportAccountProps } from '../Interface'
import { withTranslation, WithTranslation } from 'react-i18next'
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib'
import { ExportAccountWrap } from '../components'
import React from 'react'

export const ExportAccountPanel = withTranslation('common', { withRef: true })(
  ({
    exportAccountProps,
    setExportAccountToastOpen,
    ...rest
  }: ExportAccountProps & WithTranslation) => {
    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
      index: 0, // show default show
      panelList: [
        {
          key: 'trade',
          element: React.useMemo(
            () => (
              <ExportAccountWrap
                key={'transfer'}
                {...{
                  exportAccountProps,
                  setExportAccountToastOpen,
                  ...rest,
                }}
              />
            ),
            [exportAccountProps, rest, setExportAccountToastOpen],
          ),
          toolBarItem: undefined,
        },
      ],
    }
    return <SwitchPanel {...{ ...rest, ...props }} />
  },
)

// export const TransferModal = withTranslation()
