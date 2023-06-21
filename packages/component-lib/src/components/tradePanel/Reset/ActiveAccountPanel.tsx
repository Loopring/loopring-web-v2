import { ResetProps } from '../Interface'
import { withTranslation, WithTranslation } from 'react-i18next'
import { FeeInfo, IBData } from '@loopring-web/common-resources'
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib'
import React from 'react'
import { ResetWrap } from '../components'

export const ActiveAccountPanel = withTranslation('common', { withRef: true })(
  <T extends FeeInfo>({ ...rest }: ResetProps<T> & WithTranslation) => {
    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
      index: 0, // show default show
      panelList: [
        {
          key: 'trade',
          element: (
            <ResetWrap<T>
              key={'Reset'}
              {...{
                ...rest,
              }}
            />
          ),
          toolBarItem: undefined,
        },
      ],
    }
    return <SwitchPanel {...{ ...rest, ...props }} />
  },
) as <T extends IBData<I>, I>(props: ResetProps<T> & React.RefAttributes<any>) => JSX.Element

// export const TransferModal = withTranslation()
