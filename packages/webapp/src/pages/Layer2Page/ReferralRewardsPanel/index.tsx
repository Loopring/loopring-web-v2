import styled from '@emotion/styled'
import {
  Box,
  BoxProps,
  Container,
  Grid,
  InputAdornment,
  Link,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import React from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useAccount, useSubmitBtn, useToast } from '@loopring-web/core'
import {
  AccountStatus,
  AssetTabIndex,
  copyToClipBoard,
  EmptyValueTag,
  Exchange,
  ExchangeIO,
  L1L2_NAME_DEFINED,
  LinkSharedIcon,
  MapChainId,
  myLog,
  ProfileIndex,
  ProfileKey,
  SoursURL,
  TOAST_TIME,
  TradeBtnStatus,
  url_path,
  WalletSite,
} from '@loopring-web/common-resources'
import {
  Button,
  CarouselItem,
  ReferralsTable,
  RefundTable,
  ShareModal,
  Toast,
  ToastType,
  useSettings,
  OutlinedInput,
} from '@loopring-web/component-lib'
import { useReferralsTable, useRefundTable } from './hook'
import { useHistory } from 'react-router-dom'
import { ErrorPage } from '../../ErrorPage'

const BoxStyled = styled(Box)`
  ol {
    list-style: decimal inside;

    li {
      //list-item;
      color: var(--color-text-third);
      display: list-item;
      font-size: ${({ theme }) => theme.fontDefault.body1};
      // padding: ${({ theme }) => `0 ${theme.unit}`}px;
      line-height: 2em;
    }
  }
`
export const BoxBannerStyle = styled(Box)<
  BoxProps & { backGroundUrl?: string | number; direction?: 'left' | 'right' }
>`
  background-color: var(--color-box);

  .bg:after {
    display: block;
    content: '';
    float: ${({ direction }) => direction};
    width: 35%;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    background-image: url('${({ backGroundUrl }) => backGroundUrl}');
  }

  &.mobile .bg {
    position: relative;
    display: flex;
    flex-direction: column;

    &:after {
      opacity: 0.08;
      z-index: 1;
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  }
` as (
  props: BoxProps & {
    backGroundUrl?: string | number
    direction?: 'left' | 'right'
  },
) => JSX.Element

enum ReferStep {
  method1 = 0,
  method2 = 1,
}

export type ImageReferralBanner = {
  referralBanners: { en: string[] }
  lng: string[]
  position: {
    code: { default: any[]; [key: number]: any[] }
    [key: string]: any
  }
}

const ReferHeader = <R extends ImageReferralBanner>({
  isActive = true,
  handleCopy,
  link,
}: {
  link: string
  isActive?: boolean
  handleCopy: (selected: 'id' | 'link') => void
}) => {
  const {account} = useAccount()
  const {t} = useTranslation(['common', 'layout'])
  const {defaultNetwork, isMobile} = useSettings()
  const network = MapChainId[ defaultNetwork ] ?? MapChainId[ 1 ]
  const [open, setOpen] = React.useState(false)
  const [images, setImages] = React.useState<CarouselItem[]>([])

  const [imageList, setImageList] = React.useState<R>({
    // @ts-ignore
    referralBanners: {
      en: [],
    },
    lng: ['en'],
    position: {
      code: {default: [48, 30, 230, 64, '#000000', 630, 880]},
    },
  })
  // const [images, setImages] = React.useState<JSX.Element[]>([]);
  React.useEffect(() => {
    fetch(`${url_path}/referral/information.json`)
      .then((response) => response.json())
      .then((result) => {
        if (result.referralBanners) {
          setImageList(result)
          renderImage(result)
        }
      })
  }, [])
  const renderImage = React.useCallback(
    (imageList: R) => {
      let images: any[] = []
      imageList?.referralBanners?.en.forEach((item, index) => {
        const canvas: HTMLCanvasElement = document.createElement('canvas')
        let _default: any = undefined
        if (imageList?.position?.code[index]) {
          _default = imageList?.position?.code[index]
        } else {
          _default = imageList?.position?.code?.default
        }
        let [left, bottom, , , color, width, height] = _default ?? [
          48,
          30,
          230,
          64,
          '#000000',
          630,
          880,
        ]
        const lebelY = height - bottom - 100 + 20
        const lebelX = left
        const lebelCodeY = lebelY + 64
        const lebelCodeX = left
        const labelCode = t('labelReferralImageCode', {
          code: account.accountId,
        })
        const label = t('labelReferralImageDes')

        canvas.width = width
        canvas.height = height
        // @ts-ignore
        const context: CanvasRenderingContext2D = canvas.getContext('2d')
        const image = new Image()
        image.crossOrigin = 'true'
        image.src = item

        image.onload = function () {
          context.clearRect(0, 0, width, width)
          context.drawImage(image, 0, 0, width, height)
          context.font = '28px Roboto'
          context.fillStyle = color
          context.textAlign = 'left'
          context.fillText(label, lebelX, lebelY)
          context.font = '44px Roboto'
          context.fillText(labelCode, lebelCodeX, lebelCodeY)

          // myLog('imageUrl createObjectURL', canvas.toDataURL())
          images.push({imageUrl: canvas.toDataURL(), size: [width / 2, height / 2]})
          if (index + 1 == imageList?.referralBanners?.en?.length) {
            myLog('imageList', images)

            setImages(images)
          }
          // canvas.toBlob((blob) => {
          // const a = document.createElement('a')
          // // @ts-ignore
          // a.download = (item ?? '/').split('/')?.pop()
          // a.style.display = 'none'
          // // @ts-ignore
          // a.href = URL.createObjectURL(blob)
          // document.body.appendChild(a)
          // a.click()
          // document.body.removeChild(a)
          // }, 'image/png')
        }
      })
    },
    [imageList, account],
  )
  const onDownloadImage = () => {
    imageList?.referralBanners?.en.map((item, index) => {
      const canvas: HTMLCanvasElement = document.createElement('canvas')
      let _default: any = undefined
      if (imageList?.position?.code[index]) {
        _default = imageList?.position?.code[index]
      } else {
        _default = imageList?.position?.code?.default
      }
      let [left, bottom, , , color, width, height] = _default ?? [
        48,
        30,
        230,
        64,
        '#000000',
        630,
        880,
      ]
      const lebelY = height - bottom - 100 + 20
      const lebelX = left
      const lebelCodeY = lebelY + 64
      const lebelCodeX = left
      const labelCode = t('labelReferralImageCode', {
        code: account.accountId,
      })
      const label = t('labelReferralImageDes')

      canvas.width = width
      canvas.height = height
      // @ts-ignore
      const context: CanvasRenderingContext2D = canvas.getContext('2d')
      const image = new Image()
      image.crossOrigin = 'true'
      image.src = item
      image.onload = function () {
        context.clearRect(0, 0, width, width)
        context.drawImage(image, 0, 0, width, height)
        context.font = '28px Roboto'
        context.fillStyle = color
        context.textAlign = 'left'
        context.fillText(label, lebelX, lebelY)
        context.font = '44px Roboto'
        context.fillText(labelCode, lebelCodeX, lebelCodeY)

        canvas.toBlob((blob) => {
          const a = document.createElement('a')
          // @ts-ignore
          a.download = (item ?? '/').split('/')?.pop()
          a.style.display = 'none'
          // @ts-ignore
          a.href = URL.createObjectURL(blob)
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
        }, 'image/jpeg')
      }
    })
  }
  const { btnStatus, onBtnClick, btnLabel } = useSubmitBtn({
    availableTradeCheck: () => {
      return { tradeBtnStatus: TradeBtnStatus.AVAILABLE, label: '' }
    },
    isLoading: false,
    submitCallback: async () => {
      setOpen(true)
      // Carousel
      // onDownloadImage();
    },
  })

  const label = React.useMemo(() => {
    if (btnLabel) {
      const key = btnLabel.split('|')
      if (key) {
        return t(
          key[0],
          key && key[1]
            ? {
                arg: key[1],
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              }
            : {
                l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
              },
        )
      } else {
        return t(btnLabel, {
          l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
          loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
          l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
          l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
          ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
        })
      }
    } else {
      return t(`labelInvite`)
    }
  }, [t, btnLabel])

  return (
    <BoxBannerStyle
      className={isMobile ? 'mobile' : ''}
      backGroundUrl={SoursURL + '/images/giftReward.webp'}
      direction={'right'}
    >
      <Container>
        <ShareModal
          onClick={() => onDownloadImage()}
          open={open}
          loading={false}
          onClose={() => setOpen(false)}
          imageList={images}
        />
        <Box className={'bg'} marginY={3} display={'flex'}>
          <Box width={isMobile ? '100%' : '65%'}>
            <Typography
              component={'h1'}
              variant={isMobile ? 'h4' : 'h2'}
              sx={{whiteSpace: 'pre-line', wordBreak: 'break-all'}}
            >
              {t('labelReferTitle')}
            </Typography>
            <Typography
              paddingY={1}
              component={'h2'}
              variant={'body1'}
              color={'textSecondary'}
              sx={{ whiteSpace: 'pre-line', wordBreak: 'break-all' }}
            >
              {t('labelReferTitleDes')}
            </Typography>
            {account.readyState == AccountStatus.ACTIVATED && (
              <>
                <Box paddingTop={1} width={isMobile ? '100%' : '70%'}>
                  <OutlinedInput
                    size={'large'}
                    className={'copy'}
                    placeholder={'copy'}
                    value={link}
                    disabled={true}
                    fullWidth={true}
                    // onChange={(event: any) => {}}
                    startAdornment={
                      <InputAdornment position='start'>
                        <LinkSharedIcon color={'inherit'} />
                      </InputAdornment>
                    }
                    endAdornment={
                      <Button size={'small'} variant={'text'} onClick={() => handleCopy('link')}>
                        {t('labelCopy')}
                      </Button>
                    }
                  />
                </Box>
                <Box paddingTop={1} width={isMobile ? '100%' : '70%'}>
                  <OutlinedInput
                    size={'large'}
                    className={'copy'}
                    placeholder={'copy'}
                    value={account.accountId}
                    disabled={true}
                    fullWidth={true}
                    // onChange={(event: any) => {}}
                    startAdornment={
                      <InputAdornment position='start'>
                        <Typography
                          color={'var(--color-text-third)'}
                          variant={'h2'}
                          display={'inline-flex'}
                          width={36}
                          textAlign={'center'}
                          component={'span'}
                          paddingX={1 / 2}
                        >
                          #
                        </Typography>
                        {/*<LinkIcon color={"inherit"} />*/}
                      </InputAdornment>
                    }
                    endAdornment={
                      <Button size={'small'} variant={'text'} onClick={() => handleCopy('id')}>
                        {t('labelCopy')}
                      </Button>
                    }
                  />
                </Box>
              </>
            )}
            <Box marginY={2}>
              <Button
                size={'medium'}
                onClick={onBtnClick}
                loading={'false'}
                variant={'contained'}
                sx={{ minWidth: 'var(--walletconnect-width)' }}
                disabled={
                  btnStatus === TradeBtnStatus.DISABLED || btnStatus === TradeBtnStatus.LOADING
                }
              >
                {label}
              </Button>
              {/*{image.map((item, index) => (*/}
              {/*  <React.Fragment key={index}>{item}</React.Fragment>*/}
              {/*))}*/}
              <Box sx={{ display: 'block' }} height={0} width={0} overflow={'hidden'}>
                <canvas className={'canvas'} />
                {/*{images.map((item, index) => (*/}
                {/*  <React.Fragment key={index}>{item}</React.Fragment>*/}
                {/*))}*/}
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </BoxBannerStyle>
  )
}

const ReferView = () => {
  const { account } = useAccount()
  const { t } = useTranslation()
  const { defaultNetwork, isMobile } = useSettings()
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const refundData = useRefundTable(setToastOpen)
  const referralsData = useReferralsTable(setToastOpen)
  const [currentTab, setCurrentTab] = React.useState(ReferStep.method1)
  const link = `${WalletSite}?referralcode=${account.accountId}`
  const linkExchange = `${Exchange}?referralcode=${account.accountId}`
  const history = useHistory()

  const handleCopy = (selected: 'id' | 'link') => {
    switch (selected) {
      case 'id':
        copyToClipBoard(account?.accountId?.toString())
        setToastOpen({
          open: true,
          type: ToastType.success,
          content: t('labelCopyCodeClip'),
        })
        break
      case 'link':
        copyToClipBoard(link)
        setToastOpen({
          open: true,
          type: ToastType.success,
          content: t('labelCopyAddClip'),
        })
        break
    }
  }
  myLog('refundData', refundData, referralsData)
  return (
    <>
      {ProfileIndex[network]?.includes(ProfileKey.referralrewards) ? (
        <>
          <Toast
            alertText={toastOpen?.content ?? ''}
            open={toastOpen?.open ?? false}
            autoHideDuration={TOAST_TIME}
            onClose={closeToast}
            severity={toastOpen.type}
          />
          <ReferHeader handleCopy={handleCopy} link={link} />
          <Container>
            <BoxStyled marginTop={2} paddingY={2} paddingX={0} flex={1}>
              <Typography component={'h3'} variant={'h4'} marginY={2}>
                {t('labelReferralRules')}
              </Typography>
              <Tabs
                sx={{ marginLeft: -1 }}
                value={currentTab}
                className={'MuiTabs-small'}
                onChange={(_event, value) => {
                  setCurrentTab(value)
                }}
                aria-label='reward-rule-tabs'
                variant='scrollable'
              >
                <Tab label={t('labelReferralMethod1')} value={ReferStep.method1} />
                <Tab label={t('labelReferralMethod2')} value={ReferStep.method2} />
              </Tabs>
              <Box>
                {currentTab === ReferStep.method1 && (
                  <ol>
                    <li>{t('labelReferralMethod1Step1')}</li>
                    <li>{t('labelReferralMethod1Step2')}</li>
                    <li>
                      {t('labelReferralMethod1Step3', {
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                      })}
                    </li>
                    <li>{t('labelReferralMethod1Step4')}</li>
                  </ol>
                )}
                {currentTab === ReferStep.method2 && (
                  <ol>
                    <li>
                      {' '}
                      <Trans i18nKey={'labelReferralMethod2Step1'}>
                        Access the website
                        <Link href={linkExchange} target={'_blank'}>
                          {ExchangeIO}
                        </Link>
                      </Trans>
                    </li>
                    <li>{t('labelReferralMethod2Step2')}</li>
                    <li>
                      {t('labelReferralMethod2Step3', {
                        loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                        l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                        l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                        ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                        loopringLayer2: L1L2_NAME_DEFINED[network].loopringLayer2,
                      })}
                    </li>
                    <li>{t('labelReferralMethod2Step4')}</li>
                  </ol>
                )}
              </Box>

              {account.readyState === AccountStatus.ACTIVATED && (
                <>
                  <BoxStyled marginTop={2} paddingY={2} paddingX={0} flex={1}>
                    <Typography component={'h3'} variant={'h4'} marginY={2}>
                      {t('labelReferralMyReferrals')}
                    </Typography>

                    <Box display={'flex'} flexDirection={'column'}>
                      <Grid container marginY={2}>
                        <Grid item md={4} xs={6}>
                          <Typography
                            component={'span'}
                            color={'var(--color-text-third)'}
                            variant={'body1'}
                            paddingRight={isMobile ? '' : 2}
                          >
                            {t('labelReferralsTotalReferrals')}
                            {referralsData.summary?.downsidesNum &&
                            referralsData.summary?.downsidesNum != '0' ? (
                              <Typography
                                variant={'inherit'}
                                component={'span'}
                                color={'textPrimary'}
                                paddingLeft={1}
                              >
                                {referralsData.summary?.downsidesNum}
                              </Typography>
                            ) : (
                              EmptyValueTag
                            )}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          md={4}
                          xs={6}
                          justifyContent={'space-evenly'}
                          flexDirection={'column'}
                          alignItems={'flex-end'}
                          display={'flex '}
                        >
                          <Typography
                            component={'span'}
                            color={'var(--color-text-third)'}
                            variant={'body1'}
                            paddingRight={isMobile ? '' : 2}
                          >
                            {t('labelReferralsTotalEarning')}
                            {referralsData.summary?.totalValue ? (
                              <Typography
                                variant={'inherit'}
                                component={'span'}
                                color={'textPrimary'}
                                paddingLeft={1}
                              >
                                {referralsData.summary?.totalValue + ' LRC'}
                              </Typography>
                            ) : (
                              EmptyValueTag
                            )}
                          </Typography>
                        </Grid>

                        <Grid
                          item
                          md={4}
                          xs={12}
                          flexDirection={'row'}
                          alignItems={'center'}
                          display={'flex'}
                          paddingTop={isMobile ? 1 : ''}
                          justifyContent={isMobile ? 'space-between' : 'flex-end'}
                        >
                          <Typography
                            component={'span'}
                            color={'var(--color-text-third)'}
                            variant={'body1'}
                            paddingRight={isMobile ? '' : 2}
                          >
                            {t('labelReferralsClaimEarning')}
                            {referralsData.summary?.claimableValue ? (
                              <Typography
                                paddingLeft={1}
                                variant={'inherit'}
                                component={'span'}
                                color={'textPrimary'}
                              >
                                {referralsData.summary?.claimableValue + ' LRC'}
                              </Typography>
                            ) : (
                              <Typography
                                variant={'inherit'}
                                component={'span'}
                                color={'var(--color-text-third)'}
                              >
                                {EmptyValueTag}
                              </Typography>
                            )}
                          </Typography>
                          {referralsData.summary?.claimableValue ? (
                            <Button
                              variant={'contained'}
                              size={'small'}
                              sx={{ marginLeft: 2 }}
                              onClick={() => {
                                history.push(`/l2assets/assets/${AssetTabIndex.Rewards}`)
                              }}
                            >
                              {t('labelClaimBtn')}
                            </Button>
                          ) : (
                            <></>
                          )}
                        </Grid>
                      </Grid>
                      <ReferralsTable
                        {...{
                          rawData: referralsData.record,
                          pagination: {
                            pageSize: 8,
                            total: referralsData.recordTotal,
                          },
                          getList: referralsData.getReferralsTableList,
                          showloading: referralsData.showLoading,
                        }}
                      />
                    </Box>
                  </BoxStyled>
                  <BoxStyled marginTop={2} paddingY={2} paddingX={0} flex={1}>
                    <Typography component={'h3'} variant={'h4'} marginY={2}>
                      {t('labelReferralReferralsRefunds')}
                    </Typography>
                    <Grid container marginY={2}>
                      <Grid item md={4} xs={6}>
                        <Typography
                          component={'span'}
                          color={'var(--color-text-third)'}
                          variant={'body1'}
                          paddingRight={isMobile ? '' : 2}
                        >
                          {t('labelReferralsTotalTradeNumber')}
                          {refundData.summary?.tradeNum && refundData.summary?.tradeNum != '0' ? (
                            <Typography
                              variant={'inherit'}
                              component={'span'}
                              color={'textPrimary'}
                              paddingLeft={1}
                            >
                              {refundData.summary?.tradeNum}
                            </Typography>
                          ) : (
                            EmptyValueTag
                          )}
                        </Typography>
                      </Grid>
                      <Grid
                        item
                        md={4}
                        xs={6}
                        justifyContent={'space-evenly'}
                        flexDirection={'column'}
                        alignItems={'flex-end'}
                        display={'flex '}
                      >
                        <Typography
                          component={'span'}
                          color={'var(--color-text-third)'}
                          variant={'body1'}
                          paddingRight={isMobile ? '' : 2}
                        >
                          {t('labelReferralsTotalRefund')}
                          {refundData.summary?.totalValue ? (
                            <Typography
                              variant={'inherit'}
                              component={'span'}
                              color={'textPrimary'}
                              paddingLeft={1}
                            >
                              {refundData.summary?.totalValue + ' LRC'}
                            </Typography>
                          ) : (
                            EmptyValueTag
                          )}
                        </Typography>
                      </Grid>

                      <Grid
                        item
                        md={4}
                        xs={12}
                        flexDirection={'row'}
                        alignItems={'center'}
                        display={'flex'}
                        paddingTop={isMobile ? 1 : ''}
                        justifyContent={isMobile ? 'space-between' : 'flex-end'}
                      >
                        <Typography
                          component={'span'}
                          color={'var(--color-text-third)'}
                          variant={'body1'}
                          paddingRight={isMobile ? '' : 2}
                        >
                          {t('labelReferralsClaimRefund')}

                          {refundData.summary?.claimableValue ? (
                            <Typography
                              variant={'inherit'}
                              component={'span'}
                              color={'textPrimary'}
                              paddingLeft={1}
                            >
                              {refundData.summary?.claimableValue + ' LRC'}
                            </Typography>
                          ) : (
                            <Typography
                              variant={'inherit'}
                              component={'span'}
                              color={'var(--color-text-third)'}
                            >
                              {EmptyValueTag}
                            </Typography>
                          )}
                        </Typography>
                        {refundData.summary?.claimableValue ? (
                          <Button
                            variant={'contained'}
                            size={'small'}
                            sx={{ marginLeft: 2 }}
                            onClick={() => {
                              history.push(`/l2assets/assets/${AssetTabIndex.Rewards}`)
                            }}
                          >
                            {t('labelClaimBtn')}
                          </Button>
                        ) : (
                          <></>
                        )}
                      </Grid>
                    </Grid>
                    <Box display={'flex'} flexDirection={'column'}>
                      <RefundTable
                        {...{
                          rawData: refundData.record,
                          pagination: {
                            pageSize: 8,
                            total: refundData.recordTotal,
                          },
                          getList: refundData.getRefundTableList,
                          showloading: refundData.showLoading,
                        }}
                      />
                    </Box>
                  </BoxStyled>
                </>
              )}
            </BoxStyled>
          </Container>
        </>
      ) : (
        <ErrorPage messageKey={'error404'} />
      )}
    </>
  )
}
export const ReferralRewardsPanel = () => {
  return <ReferView />
}
