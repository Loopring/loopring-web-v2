import { WalletConnectBtnProps } from './Interface'
import { useTranslation } from 'react-i18next'
import React from 'react'
import {
  AccountStatus,
  ChainTests,
  CircleIcon,
  gatewayList,
  getShortAddr,
  LoadingIcon,
  LockIcon,
  myLog,
  UnConnectIcon,
  UnlockedIcon,
} from '@loopring-web/common-resources'
import { Typography, Box } from '@mui/material'
import { Button, ButtonProps } from '../../basic-lib'
import { bindHover, usePopupState } from 'material-ui-popup-state/hooks'
import styled from '@emotion/styled'
import { useSettings } from '../../../stores'
import * as sdk from '@loopring-web/loopring-sdk'

// type ChainId = sdk.ChainId | ChainIdExtends;
const WalletConnectBtnStyled = styled(Button)`
  text-transform: none;
  min-width: 120px;
  padding-left: 2px;
  padding-right: 2px;

  &.wallet-btn {
    justify-content: center;
  }

  i {
    padding-right: ${({ theme }) => theme.unit / 2}px;
    display: flex;
    justify-content: center;
    align-content: space-between;

    svg {
      height: auto;
      font-size: ${({ theme }) => theme.fontDefault.h5};
    }
  }

  &.wrong-network {
    background: var(--color-error);
    color: var(--color-text-primary);
  }
`

const ProviderBox = styled(Box)<ButtonProps & { account?: any }>`
  display: none;
  background-image: none;
  height: 100%;
  width: 48px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  ${({ account }) => {
    if (account && account.connectName) {
      const item = gatewayList.find(({ key }) => key === account.connectName)
      // connectName: keyof typeof ConnectProviders;
      return item?.imgSrc
        ? `
         display: flex;
         background-image:url(${item.imgSrc});
        `
        : ''
    }
  }};
` as (props: ButtonProps & { account: any }) => JSX.Element

export const WalletConnectBtn = ({
  accountState,
  handleClick,
  NetWorkItems,
  handleClickUnlock
}: WalletConnectBtnProps) => {
  const { t, i18n } = useTranslation(['layout', 'common'])
  const { isMobile } = useSettings()
  
  const {label, btnClassname, icon, isLocked} = React.useMemo(() => {
    const account = accountState?.account
    var label: string | undefined
    var btnClassname: string | undefined
    var icon: JSX.Element | undefined
    const isLocked = account.readyState === AccountStatus.LOCKED
    if (account) {
      const addressShort = account.accAddress ? getShortAddr(account?.accAddress) : undefined
      if (addressShort) {
        label = addressShort
      }
      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          btnClassname = 'un-connect'
          label = 'labelConnectWallet'
          break
        case AccountStatus.LOCKED:
          btnClassname = 'locked'
          icon = isMobile ? <CircleIcon fontSize={'large'} color={'error'} /> : <LockIcon color={'error'}  style={{ width: 16, height: 16 }} />
          break
        case AccountStatus.ACTIVATED:
          btnClassname = 'unlocked'
          icon = <UnlockedIcon stroke='var(--color-success)' sx={{marginBottom: 0.1, marginRight: 0.5}} style={{ width: 16, height: 16 }} />
          break
        case AccountStatus.NO_ACCOUNT:
          btnClassname = 'no-account'
          icon = <CircleIcon fontSize={'large'} color={'error'} />
          break
        case AccountStatus.DEPOSITING:
          btnClassname = 'depositing'
          icon = <LoadingIcon color={'primary'} style={{ width: 18, height: 18 }} />
          break
        case AccountStatus.NOT_ACTIVE:
          btnClassname = 'not-active'
          icon = <CircleIcon fontSize={'large'} htmlColor={'var(--color-warning)'} />
          break
        case AccountStatus.ERROR_NETWORK:
          btnClassname = 'wrong-network'
          label = 'labelWrongNetwork'
          icon = <UnConnectIcon style={{ width: 16, height: 16 }} />
          break
        default:
      }
    } else {
      label = 'labelConnectWallet'
    }
    return {
      label: label ?? '',
      btnClassname,
      icon,
      isLocked
    }
  }, [accountState?.account?.readyState, i18n, isMobile])

  const popupState = usePopupState({
    variant: 'popover',
    popupId: `popupId: 'wallet-connect-notification'`,
  })
  
  return (
    <>
      {NetWorkItems}
      {!isMobile && <ProviderBox account={accountState?.account} />}
      {isLocked && !isMobile ? (
        <Box
          display={'flex'}
          paddingLeft={'1.2rem'}
          borderRadius={'0.4rem'}
          border={'1px solid var(--color-border)'}
        >
          <Box
            component={'div'}
            paddingRight={2}
            onClick={handleClick}
            paddingY={'5px'}
            display={'flex'}
            alignItems={'center'}
          >
            <CircleIcon
              fontSize={'large'}
              htmlColor={'var(--color-error)'}
              sx={{ marginLeft: -1 }}
            />
            <Typography component={'span'} variant={'body1'} lineHeight={1} color={'inherit'}>
              {t(label)}
            </Typography>
          </Box>
          <Button
            color={'error'}
            size={'small'}
            sx={{ borderRadius: '4px', height: '34px' }}
            variant={'contained'}
            onClick={handleClickUnlock}
          >
            <LockIcon
              sx={{ marginRight: 1, marginBottom: 0.2 }}
              style={{ width: 16, height: 16 }}
            />
            <Typography component={'span'} variant={'body1'}>
              {/* Unlock First */}
              {t('labelUnlockFirst')}
            </Typography>
          </Button>
        </Box>
      ) : (
        <WalletConnectBtnStyled
          variant={
            ['un-connect', 'wrong-network'].findIndex((ele) => btnClassname === ele) !== -1
              ? 'contained'
              : 'outlined'
          }
          size={
            ['un-connect', 'wrong-network'].findIndex((ele) => btnClassname === ele) !== -1
              ? 'small'
              : 'medium'
          }
          color={'primary'}
          className={`wallet-btn ${btnClassname}`}
          onClick={handleClick}
          {...bindHover(popupState)}
        >
          {icon ? (
            <Typography component={'i'} marginLeft={-1}>
              {icon}
            </Typography>
          ) : (
            <></>
          )}
          <Typography component={'span'} variant={'body1'} lineHeight={1} color={'inherit'}>
            {t(label)}
          </Typography>
          {isLocked && (
            <Box
              ml={2}
              borderRadius={'4px'}
              bgcolor={'var(--color-error)'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              height={'28px'}
              width={'28px'}
              onClick={(e) => {
                e.stopPropagation()
                handleClickUnlock(e)
              }}
            >
              <LockIcon style={{ width: 16, height: 16, color: 'var(--color-white)' }} />
            </Box>
          )}
        </WalletConnectBtnStyled>
      )}
    </>
  )
}

export const WalletConnectL1Btn = ({
  accountState,
  handleClick,
  NetWorkItems,
  isShowOnUnConnect,
}: // isShowOnUnConnect,
WalletConnectBtnProps) => {
  const { t } = useTranslation(['layout', 'common'])
  // const { isMobile } = useSettings();
  const [label, setLabel] = React.useState<string>(t('labelConnectWallet'))

  const [btnClassname, setBtnClassname] = React.useState<string | undefined>('')
  const [icon, setIcon] = React.useState<JSX.Element | undefined>()

  React.useEffect(() => {
    const account = accountState?.account
    if (account) {
      const addressShort = account.accAddress ? getShortAddr(account?.accAddress) : undefined
      if (addressShort) {
        setLabel(addressShort)
      }
      setIcon(undefined)

      myLog('wallet connect account.readyState:', account.readyState)

      switch (account.readyState) {
        case AccountStatus.UN_CONNECT:
          setBtnClassname('un-connect')
          setLabel('labelConnectWallet')
          break
        case AccountStatus.LOCKED:
        case AccountStatus.ACTIVATED:
        case AccountStatus.NO_ACCOUNT:
        case AccountStatus.DEPOSITING:
        case AccountStatus.NOT_ACTIVE:
          setBtnClassname('unlocked')
          const chainId = account._chainId as any
          switch (chainId) {
            case sdk.ChainId.MAINNET:
              setIcon(
                <Typography
                  paddingRight={1}
                  color={'var(--color-text-third)'}
                  display={'inline-flex'}
                  alignItems={'center'}
                >
                  <CircleIcon fontSize={'large'} htmlColor={'var(--color-success)'} />
                  L1
                </Typography>,
                // <CircleIcon fontSize={"large"} ChainIdhtmlColor={"var(--color-success)"} />
              )
              break
            // case sdk.ChainId.GOERLI:
            // case ChainIdExtends[]:
            default:
              if (ChainTests.includes(Number(chainId))) {
                setIcon(
                  <Typography paddingRight={1} color={'var(--color-text-third)'}>
                    Test
                  </Typography>,
                  // <CircleIcon fontSize={"large"} htmlColor={"var(--color-success)"} />
                )
              }
              break
            // setIcon(
            //   <Typography color={'--color-text-third'>{ChainIdExtends[account._chainId]}</Typography>
            //   // <CircleIcon fontSize={"large"} htmlColor={"var(--color-success)"} />
            // );
          }
          break
        case AccountStatus.ERROR_NETWORK:
          setBtnClassname('wrong-network')
          setLabel('labelWrongNetwork')
          setIcon(<UnConnectIcon style={{ width: 16, height: 16 }} />)
          break
        default:
      }
    } else {
      setLabel('labelConnectWallet')
    }
  }, [accountState?.account?.readyState])

  const _handleClick = (event: React.MouseEvent) => {
    // debounceCount(event)
    if (handleClick) {
      handleClick(event)
    }
  }

  const popupState = usePopupState({
    variant: 'popover',
    popupId: `popupId: 'wallet-connect-notification'`,
  })
  return (
    <>
      {NetWorkItems}
      {(!isShowOnUnConnect || accountState?.account?.readyState !== AccountStatus.UN_CONNECT) && (
        <WalletConnectBtnStyled
          variant={
            ['un-connect', 'wrong-network'].findIndex((ele) => btnClassname === ele) !== -1
              ? 'contained'
              : 'outlined'
          }
          size={
            ['un-connect', 'wrong-network'].findIndex((ele) => btnClassname === ele) !== -1
              ? 'small'
              : 'medium'
          }
          color={'primary'}
          className={`wallet-btn ${btnClassname}`}
          onClick={_handleClick}
          {...bindHover(popupState)}
        >
          {icon ? (
            <Typography component={'i'} marginLeft={-1}>
              {icon}
            </Typography>
          ) : (
            <></>
          )}
          <Typography component={'span'} variant={'body1'} lineHeight={1} color={'inherit'}>
            {t(label)}
          </Typography>
        </WalletConnectBtnStyled>
      )}
    </>
  )
}
