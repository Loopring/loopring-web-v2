import { IBData, SoursURL, TRADE_TYPE, VaultJoinData, VaultLoanType } from '@loopring-web/common-resources'
import {
  CountDownIcon,
  Modal,
  SwitchPanel,
  SwitchPanelProps,
  VaultJoinProps,
} from '@loopring-web/component-lib'
import React from 'react'
import { Box, Typography, Divider, Tabs, Tab } from '@mui/material'
import { TradeMenuList, VaultJoinWrap } from '../../tradePanel/components'
import { useTranslation } from 'react-i18next'
import { useTheme } from '@emotion/react'

export const VaultJoinPanelModal = <T extends IBData<I>, V extends VaultJoinData<I>, I>({
  onSubmitClick,
  btnStatus,
  isActiveAccount,
  walletMap = {},
  coinMap = {},
  onRefreshData,
  _width,
  onToggleAddRedeem,
  isAddOrRedeem,
  panelIndex,
  handleConfirm,
  basicTrade: {onChangeEvent, switchData},
  modalOpen,
  onCloseModal,
  ...rest
}: VaultJoinProps<T, I, V>) => {
  const { t, i18n } = useTranslation()
  const theme = useTheme()

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
                    Supply Collateral
                  </Typography>
                ) : (
                  <Tabs
                    value={isAddOrRedeem}
                    onChange={(_, value) => {
                      onToggleAddRedeem(value)
                    }}
                    sx={{marginLeft: 1.5}}
                  >
                    <Tab label={'Supply'} value={'Add'} />
                    <Tab label={'Reduce'} value={'Redeem'} />
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
                  <CountDownIcon onRefreshData={onRefreshData} />
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
  return (
    <Modal
      contentClassName={'vault-wrap'}
      open={modalOpen}
      onClose={onCloseModal}
      content={
        !switchData.tradeData?.belong ? (
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
          <SwitchPanel
            _width={`calc(var(--modal-width) - ${(theme.unit * 5) / 2}px)`}
            _height={'auto'}
            {...{ ...rest, i18n, t, tReady: true, ...props }}
          />
        )
      }
    />
  )
}
