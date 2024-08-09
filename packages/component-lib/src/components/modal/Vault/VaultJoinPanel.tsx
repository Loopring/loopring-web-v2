import { IBData, SoursURL, TRADE_TYPE, VaultJoinData, VaultLoanType } from '@loopring-web/common-resources'
import {
  CountDownIcon,
  SwitchPanel,
  SwitchPanelProps,
  VaultJoinProps,
} from '@loopring-web/component-lib'
import React from 'react'
import { Box, Typography, Divider, Tabs, Tab } from '@mui/material'
import { TradeMenuList, useBasicTrade, VaultJoinWrap } from '../../tradePanel/components'
import { useTranslation } from 'react-i18next'

export const VaultJoinPanel = <T extends IBData<I>, V extends VaultJoinData<I>, I>({
  onSubmitClick,
  btnStatus,
  isActiveAccount,
  walletMap = {},
  coinMap = {},
  onRefreshData,
  refreshRef,
  _width,
  onToggleAddRedeem,
  isAddOrRedeem,
  ...rest
}: VaultJoinProps<T, I, V>) => {
  const { t, i18n } = useTranslation()
  const { onChangeEvent, index, switchData } = useBasicTrade({
    ...rest,
    type: TRADE_TYPE.TOKEN,
    walletMap,
    coinMap,
  } as any)
  const [panelIndex, setPanelIndex] = React.useState(index)
  const handleConfirm = (index: number) => {
    setPanelIndex(index)
  }
  React.useEffect(() => {
    setPanelIndex(index)
  }, [index])

  const props: SwitchPanelProps<'tradeMenuList' | 'trade' | 'confirm'> = {
    index: panelIndex, // show default show
    panelList: [
      {
        key: 'trade',
        // onBack,
        element: React.useMemo(
          () => (
            // @ts-ignore
            <VaultJoinWrap
              key={'trade'}
              {...{
                ...rest,
                isActiveAccount,
                tradeData: switchData.tradeData,
                onChangeEvent,
                disabled: !!rest.disabled,
                handleConfirm,
                onSubmitClick,
                btnStatus,
                walletMap,
                coinMap,
                isAddOrRedeem,
              }}
            />
          ),
          [
            rest,
            switchData.tradeData,
            onChangeEvent,
            onSubmitClick,
            // onDepositClick,
            btnStatus,
            walletMap,
            coinMap,
            isAddOrRedeem,
          ],
        ),
        toolBarItem: React.useMemo(
          () => (
            <>
              <Box sx={{ height: '55px' }} className={'toolbarTitle'}>
                {isActiveAccount ? (
                  <Typography marginBottom={1.5} variant={'h5'} component={'span'} paddingX={3}>
                    {t('labelVaultJoinTitle')}
                  </Typography>
                ) : (
                  <Tabs
                    value={isAddOrRedeem}
                    onChange={(_, value) => {
                      onToggleAddRedeem(value)
                    }}
                    sx={{marginLeft: 1.5}}
                  >
                    <Tab label={'Add'} value={'Add'} />
                    <Tab label={'Redeem'} value={'Redeem'} />
                  </Tabs>
                )}

                <Typography
                  display={'inline-block'}
                  marginLeft={2}
                  component={'span'}
                  visibility={'hidden'}
                  height={0}
                  width={0}
                >
                  <CountDownIcon onRefreshData={onRefreshData} ref={refreshRef} />
                </Typography>
                <Divider style={{ marginTop: '2px' }}/>
              </Box>
            </>
          ),
          [isAddOrRedeem, isActiveAccount],
        ),
      },
      {
        key: 'tradeMenuList',
        element: React.useMemo(
          () => (
            // @ts-ignore
            <TradeMenuList
              {...{
                nonZero: false,
                sorted: true,
                t,
                ...rest,
                onChangeEvent,
                //rest.walletMap,
                selected: switchData.tradeData.belong,
                tradeData: switchData.tradeData,
                walletMap,
                coinMap,
                //oinMap
              }}
            />
          ),
          [rest, onChangeEvent, switchData.tradeData, walletMap, coinMap],
        ),
        toolBarItem: undefined,
      },
    ],
  }
  return !switchData.tradeData?.belong ? (
    <Box
      height={'580px'}
      width={'var(--modal-width)'}
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
    >
      <img
        className='loading-gif'
        alt={'loading'}
        width='60'
        src={`${SoursURL}images/loading-line.gif`}
      />
    </Box>
  ) : (
    <SwitchPanel _width={'var(--modal-width)'} {...{ ...rest, i18n, t, tReady: true, ...props }} />
  )
}
