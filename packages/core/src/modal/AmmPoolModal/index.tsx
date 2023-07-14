import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  boxLiner,
  ModalBackButton,
  ModalCloseButton,
  SwitchPanelStyled,
  Toast,
  ToastType,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { myLog, TOAST_TIME } from '@loopring-web/common-resources'
import { Box, Link, Modal as MuiModal } from '@mui/material'
import styled from '@emotion/styled'
import { store, useAmmMap } from '../../index'
import { AmmPanelView } from './components/ammPanel'
import { useTheme } from '@emotion/react'
import { useAmmCommon } from '../../hooks/useractions/hookAmmCommon'
import { ChartAndInfoPanel } from './components/chartAndInfo'
import { AmmRecordPanel } from './components/ammRecordPanel'

const BoxStyle = styled(Box)`
  .rdg {
    background: var(--color-box);
    border-bottom-left-radius: ${({ theme }) => theme.unit}px;
    border-bottom-right-radius: ${({ theme }) => theme.unit}px;
  }
`
const BoxLinear = styled(SwitchPanelStyled)`
  && {
    ${({ theme }) => boxLiner({ theme })};

    .trade-panel {
      background: initial;

      .react-swipeable-view-container > div {
        height: initial;
      }
    }

    @media only screen and (max-height: 680px) {
      height: 100vh;
      overflow: scroll;
    }
    @media only screen and (max-width: 768px) {
      height: 86%;
      overflow: scroll;
    }
  }
`
const Content = withTranslation('common')(
  ({
    t,
    market,
    setPanelIndex,
    panelIndex,
    ...rest
  }: WithTranslation & { market: string } & any) => {
    const {
      modals: {
        isShowAmm: { type },
      },
      setShowAmm,
    } = useOpenModals()
    const { isMobile } = useSettings()
    const theme = useTheme()
    const {
      toastOpen,
      setToastOpen,
      closeToast,
      refreshRef,
      updateAmmPoolSnapshot,
      updateExitFee,
      updateJoinFee,
    } = useAmmCommon({ market })
    myLog('amm type', type)
    return (
      <>
        <Box
          display={'flex'}
          width={'100%'}
          flexDirection={'column'}
          alignItems={!isMobile ? 'stretch' : 'center'}
        >
          {panelIndex === 1 ? (
            <ModalBackButton
              marginTop={'-27px'}
              marginLeft={1}
              onBack={() => {
                setPanelIndex(0)
              }}
            />
          ) : (
            <>
              {isMobile && (
                <Link
                  position={'absolute'}
                  variant={'body1'}
                  sx={{
                    left: 2 * theme.unit,
                    top: 2 * theme.unit,
                    zIndex: 999,
                  }}
                  onClick={() => {
                    setPanelIndex(1)
                  }}
                >
                  {t('labelAMMTransactionsLink')}
                </Link>
              )}
            </>
          )}
          <ModalCloseButton
            onClose={() => {
              setShowAmm({ isShow: false })
            }}
            t={t}
            {...rest}
          />
        </Box>
        {panelIndex === 0 && (
          <Box
            flex={1}
            alignSelf={'center'}
            flexDirection={!isMobile ? 'row' : 'column'}
            alignItems={!isMobile ? 'stretch' : 'center'}
            justifyContent={'stretch'}
            position={'relative'}
            display={'flex'}
          >
            {!isMobile && (
              <Link
                position={'absolute'}
                variant={'body1'}
                sx={{
                  right: 2 * theme.unit,
                  top: 2 * theme.unit,
                  zIndex: 999,
                }}
                onClick={() => {
                  setPanelIndex(1)
                }}
              >
                {t('labelAMMTransactionsLink')}
              </Link>
            )}
            <Box
              marginBottom={2}
              display={'flex'}
              width={isMobile ? '100%' : 'initial'}
              flexDirection={isMobile ? 'column' : 'row'}
            >
              <Toast
                alertText={toastOpen?.content ?? ''}
                severity={toastOpen?.type ?? ToastType.success}
                open={toastOpen?.open ?? false}
                autoHideDuration={TOAST_TIME}
                onClose={closeToast}
              />
              <AmmPanelView
                market={market}
                updateExitFee={updateExitFee}
                updateJoinFee={updateJoinFee}
                ammType={type}
                setToastOpen={setToastOpen}
                refreshRef={refreshRef}
                updateAmmPoolSnapshot={updateAmmPoolSnapshot}
              />
              <ChartAndInfoPanel market={market} setToastOpen={setToastOpen} />
            </Box>
          </Box>
        )}
        {panelIndex === 1 && (
          <BoxStyle display={'flex'} overflow={'scroll'} flex={1} height={'100%'}>
            {market && <AmmRecordPanel market={market} />}
          </BoxStyle>
        )}
      </>
    )
  },
)

export const ModalCoinPairPanel = () => {
  const {
    modals: {
      isShowAmm: { isShow },
    },
    setShowAmm,
  } = useOpenModals()
  const [panelIndex, setPanelIndex] = React.useState<0 | 1>(0)
  const { ammMap } = useAmmMap()
  const [market, setMarket] = React.useState<string>('')
  React.useEffect(() => {
    if (isShow) {
      const { symbol } = store.getState().modals.isShowAmm
      setMarket((market) => {
        if (symbol !== market) {
          return ammMap[`AMM-${symbol}`] ? ammMap[`AMM-${symbol}`].market : 'LRC-ETH'
        } else {
          return market == '' ? 'LRC-ETH' : market
        }
      })
    }
    return () => {
      setPanelIndex(0)
      setMarket('')
    }
  }, [isShow])

  const { isMobile } = useSettings()
  return (
    <MuiModal
      open={isShow}
      onClose={() => {
        setShowAmm({ isShow: false })
      }}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <BoxLinear
        width={'80%'}
        minWidth={isMobile ? 'initial' : 720}
        maxWidth={isMobile ? 'initial' : 1000}
        position={'relative'}
        style={{ alignItems: 'stretch' }}
      >
        {market && ammMap['AMM-' + market] ? (
          <Content
            market={market.replace('AMM-', '')}
            panelIndex={panelIndex}
            setPanelIndex={setPanelIndex}
          />
        ) : (
          <></>
        )}
      </BoxLinear>
    </MuiModal>
  )
}
