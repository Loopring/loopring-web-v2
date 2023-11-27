import { ResetProps } from '../Interface'
import { withTranslation, WithTranslation } from 'react-i18next'
import { FeeInfo, IBData } from '@loopring-web/common-resources'
import { SwitchPanel, SwitchPanelProps } from '../../basic-lib'
import { ResetWrap } from '../components'
import React from 'react'

export const ResetPanel = withTranslation('common', { withRef: true })(
  <T extends FeeInfo>({
    onResetClick,
    resetBtnStatus,
    chargeFeeTokenList,
    assetsData,
    ...rest
  }: ResetProps<T> & WithTranslation) => {
    const props: SwitchPanelProps<'tradeMenuList' | 'trade'> = {
      index: 0, // show default show
      panelList: [
        {
          key: 'trade',
          element: (
            <ResetWrap<T>
              key={'transfer'}
              {...{
                ...rest,
                resetBtnStatus,
                chargeFeeTokenList,
                onResetClick,
                assetsData,
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
