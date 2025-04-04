import { WithTranslation, withTranslation } from 'react-i18next'
import { ModalBackButton, SwitchPanel, SwitchPanelProps } from '../../basic-lib'
import { WithdrawProps } from '../../tradePanel'
import { IBData, SoursURL, TRADE_TYPE } from '@loopring-web/common-resources'
import { TradeMenuList, useBasicTrade, WithdrawWrap } from '../../tradePanel/components'
import React from 'react'
import { cloneDeep } from 'lodash'
import { WithdrawConfirm } from '../../tradePanel/components/WithdrawConfirm'
import { ContactSelection } from '../../tradePanel/components/ContactSelection'
import { Box } from '@mui/material'
// import { getAllContacts } from "./TransferPanel";

export const WithdrawPanel = withTranslation(['common', 'error'], {
  withRef: true,
})(
  <T extends IBData<I>, I>({
    type = TRADE_TYPE.TOKEN,
    chargeFeeTokenList,
    onWithdrawClick,
    withdrawBtnStatus,
    assetsData,
    walletMap = {},
    coinMap = {},
    onBack,
    isFromContact,
    contact,
    contacts,
    ...rest
  }: WithdrawProps<T, I> & WithTranslation & { assetsData: any[] }) => {
    const { onChangeEvent, index, switchData } = useBasicTrade({
      ...rest,
      coinMap,
      type,
      walletMap,
    })
    // const _onChangeEvent = _.debounce((_index: 0 | 1, { to, tradeData }: SwitchData<T>) => {
    //   onChangeEvent(_index, { to, tradeData })
    // }, globalSetup.wait)

    const [panelIndex, setPanelIndex] = React.useState(index + 1)
    const handleConfirm = (index: number) => {
      setPanelIndex(index)
    }
    // React.useEffect(() => {
    //   return () => {
    //     _onChangeEvent.cancel()
    //   }
    // }, [])
    // const hanleConfirm = () => {};
    React.useEffect(() => {
      setPanelIndex(index + 1)
    }, [index])

    // LP token should not exist in withdraw panel for now
    const getWalletMapWithoutLP = React.useCallback(() => {
      const clonedWalletMap = cloneDeep(walletMap ?? {})
      const keyList = Object.keys(clonedWalletMap)
      keyList.forEach((key) => {
        const [first] = key.split('-')
        if (first === 'LP') {
          delete clonedWalletMap[key]
        }
      })
      return clonedWalletMap
    }, [walletMap])

    const confirmPanel = {
      key: 'confirm',
      element: React.useMemo(
        () => (
          <WithdrawConfirm
            {...{
              ...rest,
              onWithdrawClick,
              type,
              tradeData: switchData.tradeData,
              handleConfirm,
            }}
          />
        ),
        [onWithdrawClick, rest, switchData.tradeData, type],
      ),
      toolBarItem: (
        <ModalBackButton
          marginTop={0}
          marginLeft={-2}
          onBack={() => {
            setPanelIndex(1)
          }}
          {...rest}
        />
      ),
    }
    const tradePanel = {
      key: 'withdraw',
      element: React.useMemo(
        () => (
          // @ts-ignore
          <WithdrawWrap
            key={'withdraw'}
            {...{
              ...rest,
              type,
              handleConfirm,
              chargeFeeTokenList: chargeFeeTokenList ? chargeFeeTokenList : [],
              tradeData: switchData.tradeData,
              onChangeEvent,
              coinMap,
              disabled: rest.disabled,
              // onWithdrawClick,
              withdrawBtnStatus,
              assetsData,
              walletMap,

              isFromContact,
              contact,
              onClickContact: () => {
                setPanelIndex(3)
              },
            }}
          />
        ),
        [
          rest,
          type,
          chargeFeeTokenList,
          switchData.tradeData,
          onChangeEvent,
          coinMap,
          onWithdrawClick,
          withdrawBtnStatus,
          assetsData,
          walletMap,
        ],
      ),
      toolBarItem: React.useMemo(
        () => (
          <>
            {onBack ? (
              <ModalBackButton
                marginTop={0}
                marginLeft={-2}
                onBack={() => {
                  onBack()
                }}
                {...rest}
              />
            ) : (
              <></>
            )}
          </>
        ),
        [onBack],
      ),
    }
    const tokenSelectionPanel = {
      key: 'tradeMenuList',
      element: React.useMemo(
        () => (
          <TradeMenuList
            {...{
              nonZero: true,
              sorted: true,
              ...rest,
              onChangeEvent,
              coinMap,
              selected: switchData.tradeData.belong,
              tradeData: switchData.tradeData,
              walletMap: getWalletMapWithoutLP(),
              //oinMap
            }}
          />
        ),
        [switchData, rest, onChangeEvent, getWalletMapWithoutLP],
      ),
      toolBarItem: undefined,
    }

    const contactSelectionPanel = {
      key: 'contactSelection',
      element: React.useMemo(
        () => (
          <ContactSelection
            key={'contactSelection'}
            contacts={contacts}
            onSelect={(address) => {
              setPanelIndex(1)
              rest.handleOnAddressChange(address, true)
            }}
            scrollHeight={rest.isToMyself ? '280px' : '480px'}
          />
        ),
        [contacts],
      ),
      toolBarItem: React.useMemo(
        () => (
          <ModalBackButton
            marginTop={0}
            marginLeft={-2}
            onBack={() => {
              setPanelIndex(1)
            }}
            {...rest}
          />
        ),
        [onBack],
      ),
    }

    const props: SwitchPanelProps<string> = {
      index: panelIndex, // show default show
      panelList: [confirmPanel, tradePanel, tokenSelectionPanel, contactSelectionPanel],
    }
    return type == TRADE_TYPE.TOKEN && !switchData.tradeData?.belong ? (
      <Box
        display={'flex'}
        height={'var(--min-height)'}
        width={'var(--modal-width)'}
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
      <SwitchPanel {...{ ...rest, ...props }} />
    )
  },
) as <T, I>(props: WithdrawProps<T, I> & React.RefAttributes<any>) => JSX.Element
