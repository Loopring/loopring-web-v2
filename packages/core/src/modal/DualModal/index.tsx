import { WithTranslation, withTranslation } from 'react-i18next'
import {
  boxLiner,
  CoinIcons,
  ConfirmInvestDualAutoRisk,
  ConfirmInvestDualDipRisk,
  ConfirmInvestDualGainRisk,
  ConfirmInvestDualRisk,
  CountDownIcon,
  DualWrap,
  DualWrapProps,
  ModalCloseButton,
  SwitchPanelStyled,
  Toast,
  TOASTOPEN,
  ToastType,
  useOpenModals,
  useSettings,
} from '@loopring-web/component-lib'
import { useHistory, useLocation } from 'react-router-dom'
import { Box, Divider, Modal as MuiModal, Typography } from '@mui/material'
import styled from '@emotion/styled'
import {
  DualInvestConfirmType,
  DualViewType,
  TOAST_TIME,
  TokenType,
} from '@loopring-web/common-resources'
import { DUAL_TYPE } from '@loopring-web/loopring-sdk'
import { confirmation } from '../../stores'
import React from 'react'

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

export const ModalDualPanel = withTranslation('common')(
  ({
    t,
    viewType,
    dualTradeProps,
    dualToastOpen,
    closeDualToast,
    isBeginnerMode,
    confirmDualAutoInvest,
    setConfirmDualAutoInvest,
    ...rest
  }: WithTranslation & {
    viewType: DualViewType | undefined
    dualTradeProps: DualWrapProps<any, any, any>
    dualToastOpen?: TOASTOPEN
    closeDualToast?: (state: boolean) => void
    isBeginnerMode: boolean
    confirmDualAutoInvest: boolean
    setConfirmDualAutoInvest: (state: boolean) => void
  }) => {
    const history = useHistory()
    const { search, pathname } = useLocation()
    const searchParams = new URLSearchParams(search)
    const {
      modals: { isShowDual },
      setShowDual,
    } = useOpenModals()
    const { isShow, dualInfo } = isShowDual ?? {}
    const { isMobile, coinJson } = useSettings()
    const [showDualAlert, setShowAlert] = React.useState(false)
    React.useEffect(() => {
      // @ts-ignore
      if (viewType && viewType !== '') {
        setShowAlert(true)
      }
    }, [viewType])
    // const [confirmDualInvest, setConfirmDualInvest] = React.useState<undefined | string | false>(
    //   undefined,
    // )
    //
    const {
      confirmation: {
        confirmDualAutoInvest: _confirmDualAutoInvest,
        confirmedDualInvestV2,
        confirmDualDipInvest,
        confirmDualGainInvest,
      },
      confirmDualAutoInvest: confirmDualAutoInvestFun,
      confirmDualInvest: confirmDualInvestFun,
      confirmDualDipInvest: confirmDualDipInvestFun,
      confirmDualGainInvest: confirmDualGainInvestFun,
    } = confirmation.useConfirmation()

    return (
      <>
        <MuiModal
          // open={true}
          open={isShow}
          onClose={() => {
            setShowDual({ isShow: false, dualInfo: undefined })
          }}
          aria-labelledby='modal-modal-title'
          aria-describedby='modal-modal-description'
        >
          <BoxLinear
            width={isMobile ? '90%' : '600px'}
            height={isMobile ? 'auto' : 'inherit'}
            // width={"80%"}
            // minWidth={isMobile ? "initial" : 720}
            // maxWidth={isMobile ? "initial" : 1000}
            position={'relative'}
            style={{ alignItems: 'stretch' }}
          >
            <ModalCloseButton
              onClose={() => {
                setShowDual({ isShow: false, dualInfo: undefined })
              }}
              t={t}
              {...rest}
            />
            <Box
              width={'100%'}
              display={'flex'}
              position={'relative'}
              marginTop={'var(--toolbar-row-padding-minus)'}
              minHeight={'var(--toolbar-row-height)'}
              paddingX={3}
            >
              <Box component={'h3'} display={'flex'} flexDirection={'row'} alignItems={'center'}>
                {dualInfo?.productId && (
                  <>
                    <Typography component={'span'} display={'inline-flex'}>
                      {/* eslint-disable-next-line react/jsx-no-undef */}
                      <CoinIcons
                        type={TokenType.dual}
                        size={32}
                        tokenIcon={[coinJson[dualInfo.sellSymbol], coinJson[dualInfo.buySymbol]]}
                      />
                    </Typography>
                    <Typography component={'span'} flexDirection={'column'} display={'flex'}>
                      <Typography component={'span'} display={'inline-flex'} color={'textPrimary'}>
                        {t(
                          dualInfo.__raw__.info.dualType === DUAL_TYPE.DUAL_BASE
                            ? 'labelDualInvestBaseTitle'
                            : 'labelDualInvestQuoteTitle',
                          {
                            symbolA: dualInfo.sellSymbol,
                            symbolB: dualInfo.buySymbol,
                          },
                        )}
                      </Typography>
                    </Typography>
                  </>
                )}
              </Box>
              <Box alignSelf={'flex-end'} sx={{ display: 'none' }}>
                {/*sx={{ display: "none" }}*/}
                <CountDownIcon
                  onRefreshData={dualTradeProps.onRefreshData}
                  // viewType={viewType}
                  ref={dualTradeProps.refreshRef}
                />
              </Box>
            </Box>
            <Divider sx={{ marginX: 2 }} />
            <Box
              flex={1}
              // flexDirection={!isMobile ? "row" : "column"}
              alignItems={!isMobile ? 'flex-start' : 'center'}
              position={'relative'}
              display={'flex'}
              paddingTop={2}
              paddingBottom={1}
              paddingX={1}
              sx={
                isMobile
                  ? {
                      maxHeight: 'initial',
                      overflowY: 'initial',
                    }
                  : { maxHeight: 'var(--lage-modal-height)', overflowY: 'scroll' }
              }
            >
              <DualWrap isBeginnerMode={isBeginnerMode} {...{ ...rest, ...dualTradeProps }} />
            </Box>
            <Toast
              alertText={dualToastOpen?.content ?? ''}
              severity={dualToastOpen?.type ?? ToastType.success}
              open={dualToastOpen?.open ?? false}
              autoHideDuration={TOAST_TIME}
              onClose={() => {
                if (closeDualToast) {
                  closeDualToast(false)
                }
              }}
            />
          </BoxLinear>
        </MuiModal>
        <ConfirmInvestDualAutoRisk
          open={confirmDualAutoInvest}
          handleClose={(_e, isAgree) => {
            if (!isAgree) {
              dualTradeProps.onChangeEvent({
                tradeData: {
                  ...dualTradeProps.dualCalcData?.coinSell,
                  isRenew: false,
                } as any,
              })
            } else {
              dualTradeProps.onChangeEvent({
                tradeData: {
                  ...dualTradeProps.dualCalcData?.coinSell,
                  isRenew: true,
                } as any,
              })
              confirmDualAutoInvestFun()
            }
            setConfirmDualAutoInvest(false)
          }}
        />

        <ConfirmInvestDualRisk
          open={
            !confirmedDualInvestV2 &&
            showDualAlert &&
            [DualViewType.All, DualViewType.DualBegin].includes(viewType as any)
          }
          USDCOnly={confirmedDualInvestV2 === 'USDCOnly'}
          handleClose={(_e, isAgree: DualInvestConfirmType | undefined) => {
            if (!isAgree) {
              setShowAlert(false)
              searchParams.set('viewType', '')
              history.goBack()
              history.push(pathname + '?' + searchParams.toString())
            } else {
              confirmDualInvestFun(isAgree)
              setShowAlert(false)
            }
          }}
        />
        <ConfirmInvestDualGainRisk
          open={
            !confirmDualGainInvest &&
            showDualAlert &&
            [DualViewType.DualGain].includes(viewType as any)
          }
          handleClose={(_e, isAgree) => {
            if (!isAgree) {
              setShowAlert(false)
              // history.goBack()
              searchParams.set('viewType', '')
              history.push(pathname + '?' + searchParams.toString())
            } else {
              confirmDualGainInvestFun()
              setShowAlert(false)
            }
          }}
        />
        <ConfirmInvestDualDipRisk
          open={
            !confirmDualDipInvest &&
            showDualAlert &&
            [DualViewType.DualDip].includes(viewType as any)
          }
          handleClose={(_e, isAgree) => {
            if (!isAgree) {
              setShowAlert(false)
              searchParams.set('viewType', '')
              // history.goBack()
              history.push(pathname + '?' + searchParams.toString())
            } else {
              confirmDualDipInvestFun()
              setShowAlert(false)
            }
          }}
        />
      </>
    )
  },
)
