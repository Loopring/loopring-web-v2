import { useTranslation, WithTranslation, withTranslation } from 'react-i18next'
import React, { MouseEventHandler, ReactNode, useCallback } from 'react'
import {
  AccountStatus,
  ApprovalIcon,
  BackIcon,
  CopyIcon,
  copyToClipBoard,
  ExitIcon,
  FailedIcon,
  HelpIcon,
  L1L2_NAME_DEFINED,
  LockGuardianIcon,
  LOOPRING_DOCUMENT,
  MapChainId,
  myLog,
  RefuseIcon,
  RoundAddIcon,
  ViewHistoryIcon,
} from '@loopring-web/common-resources'
import { Box, Button, Link, Tooltip, Typography } from '@mui/material'
import { GuardianStep, QRCodePanel, useSettings } from '@loopring-web/component-lib'
import { BtnConnectL1, useAccount } from '@loopring-web/core'
import { useRouteMatch } from 'react-router-dom'
import { useHebaoMain } from './hook'
import { ModalLock } from './modal'
import { WalletHistory } from './WalletHistory'
import { WalletValidationInfo } from './WalletValidationInfo'
import { WalletProtector } from './WalletProtector'
import styled from '@emotion/styled'
import { walletServices } from '@loopring-web/web3-provider'
import { GuardianModal } from './GuardianModal'
import * as sdk from '@loopring-web/loopring-sdk'

const WrongStatusStyled = styled(Box)`
  display: flex;
  justify-content: center;
  flex-direction: column;
  width: 100%;
  align-items: center;
  padding: ${({ theme }) => theme.unit * 10}px auto;
  background-color: ${({ theme }) => theme.colorBase.box};

  .logo {
    margin-bottom: ${({ theme }) => theme.unit * 8}px;
  }

  .content {
    text-align: center;
    color: ${({ theme }) => theme.colorBase.textSecondary};
    width: ${({ theme }) => theme.unit * 50}px;
    margin-bottom: ${({ theme }) => theme.unit * 8}px;
  }

  .button {
    color: ${({ theme }) => theme.colorBase.textSecondary};
  }
`

const WrongStatus = ({
  logo,
  content,
  onClickDisconnect,
}: {
  logo: ReactNode
  content: string
  onClickDisconnect: MouseEventHandler
}) => {
  const { t } = useTranslation()
  return (
    <WrongStatusStyled>
      <Box className='logo'>{logo}</Box>
      <Typography className={'content'}>{content}</Typography>
      <Button className={'button'} onClick={onClickDisconnect}>
        <ExitIcon />
        <Typography marginLeft={0.5}>{t('labelDisconnect')}</Typography>
      </Button>
    </WrongStatusStyled>
  )
}

const SectionStyled = styled(Box)<{ isMobile?: boolean }>`
  padding: ${({ theme }) => theme.unit * 4}px;
  padding-top: initial;
  padding-bottom: initial;
  background: ${({ theme }) => theme.colorBase.box};
  margin-bottom: ${({ theme }) => theme.unit * 2}px;
  width: ${({ theme, isMobile }) => (isMobile ? '100%' : `${theme.unit * 60}px`)};
  height: 96px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const Section = ({
  logo,
  title,
  description,
  onClick,
}: {
  logo: JSX.Element
  title: string
  description?: string
  onClick: MouseEventHandler
}) => {
  const { isMobile } = useSettings()
  return (
    <>
      <SectionStyled isMobile={isMobile} onClick={onClick}>
        <Box display={'flex'} alignItems={'center'}>
          {logo}
          <Box paddingLeft={3}>
            <Typography variant={'h4'}>{title}</Typography>
            {description && (
              <Typography color={'var(--color-text-third) '}>{description}</Typography>
            )}
          </Box>
        </Box>
        <BackIcon sx={{ transform: 'rotate(180deg)' }} />
      </SectionStyled>
    </>
  )
}

const ContainerStyled = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: center;
  padding: ${({ theme }) => theme.unit * 10}px auto;
`

export const GuardianPage = withTranslation(['common'])(({ t, ..._rest }: WithTranslation) => {
  const { account } = useAccount()
  const { defaultNetwork, isMobile } = useSettings()
  const network = MapChainId[defaultNetwork] ?? MapChainId[1]
  const networkName: sdk.NetworkWallet = ['ETHEREUM', 'GOERLI'].includes(network)
    ? sdk.NetworkWallet.ETHEREUM
    : sdk.NetworkWallet[network]
  const [openQRCode, setOpenQRCode] = React.useState(false)
  const onOpenAdd = React.useCallback((open: boolean) => {
    setOpenQRCode(open)
  }, [])
  const [showHistory, setShowHistory] = React.useState(false)
  const onOpenHistory = React.useCallback((open: boolean) => {
    setShowHistory(open)
  }, [])
  const [showApprovalRequests, setShowApprovalRequests] = React.useState(false)
  const onOpenApprovalRequests = React.useCallback((open: boolean) => {
    setShowApprovalRequests(open)
  }, [])

  const [showLockWallet, setShowLockWallet] = React.useState(false)
  const onOpenLockWallet = React.useCallback((open: boolean) => {
    setShowLockWallet(open)
  }, [])

  const {
    protectList,
    guardiansList,
    guardianConfig,
    openHebao,
    operationLogList,
    setOpenHebao,
    loadData,
    loopringSmartContractWallet,
    nonLoopringSmartContractWallet,
  } = useHebaoMain()
  const handleOpenModal = ({ step, options }: { step: GuardianStep; options?: any }) => {
    setOpenHebao((state) => {
      state.isShow = true
      state.step = step
      state.options = {
        ...state.options,
        ...options,
      }
      return { ...state }
    })
  }
  const isContractAddress =
    loopringSmartContractWallet === true || nonLoopringSmartContractWallet === true
  const onClickCopy = useCallback((str: string) => {
    copyToClipBoard(str)
  }, [])

  switch (account.readyState) {
    case AccountStatus.UN_CONNECT:
      return (
        <Box
          flex={1}
          display={'flex'}
          justifyContent={'center'}
          flexDirection={'column'}
          alignItems={'center'}
        >
          <Typography marginTop={3} variant={isMobile ? 'h4' : 'h1'} textAlign={'center'}>
            {t('describeTitleConnectToWalletAsGuardian', {
              layer2: L1L2_NAME_DEFINED[network].layer2,
              l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
            })}
          </Typography>
          <Link
            marginY={2}
            variant={'body1'}
            textAlign={'center'}
            color={'textSecondary'}
            target='_blank'
            rel='noopener noreferrer'
            href={LOOPRING_DOCUMENT + 'walletdesign_en.md'}
          >
            {t('describeWhatIsGuardian')}
          </Link>
          <BtnConnectL1 />
        </Box>
      )
    case AccountStatus.LOCKED:
    case AccountStatus.NO_ACCOUNT:
    case AccountStatus.NOT_ACTIVE:
    case AccountStatus.DEPOSITING:
    case AccountStatus.ACTIVATED:
      if (loopringSmartContractWallet) {
        return (
          <WrongStatus
            logo={<RefuseIcon htmlColor='var(--color-warning)' style={{ width: 60, height: 60 }} />}
            content={t('labelWalletLoopringSmartWallet')}
            onClickDisconnect={() => {
              walletServices.sendDisconnect('', 'customer click disconnect')
            }}
          />
        )
      } else if (nonLoopringSmartContractWallet) {
        return (
          <WrongStatus
            logo={<FailedIcon htmlColor='var(--color-error)' style={{ width: 60, height: 60 }} />}
            content={t('labelWalletNonLoopringSmartWallet')}
            onClickDisconnect={() => {
              walletServices.sendDisconnect('', 'customer click disconnect')
            }}
          />
        )
      }
      break
    default:
      break
  }
  myLog(
    'HebaoAddGuardian URL',
    `${networkName?.toLowerCase()}:${account?.accAddress}?type=${
      account?.connectName
    }&action=HebaoAddGuardian`,
  )
  // const { isMobile } = useSettings();
  return (
    <>
      <GuardianModal
        open={openQRCode}
        onClose={() => onOpenAdd(false)}
        title={
          <Typography component={'p'} textAlign={'center'} marginBottom={1}>
            <Typography
              color={'var(--color-text-primary)'}
              component={'p'}
              variant={'h4'}
              marginBottom={2}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              {t('labelWalletAddAsGuardian')}
              <Tooltip title={<>{t('labelWalletGuardianHint')}</>}>
                <Box marginLeft={1} display={'flex'} alignItems={'center'}>
                  <HelpIcon fontSize='large' />
                </Box>
              </Tooltip>
            </Typography>
            <Typography
              color={'var(--color-text-secondary)'}
              component={'p'}
              variant={'body1'}
              marginBottom={2}
            >
              {t('labelWalletScanQRCode')}
            </Typography>
          </Typography>
        }
        body={
          <QRCodePanel
            description={
              <Button onClick={() => account?.accAddress && onClickCopy(account?.accAddress)}>
                <Typography
                  marginTop={2}
                  component={'div'}
                  variant={'body2'}
                  display={'flex'}
                  justifyContent={'center'}
                  alignItems={'center'}
                >
                  <Typography
                    color={'var(--color-text-secondary)'}
                    component={'p'}
                    variant={'inherit'}
                    display={'flex'}
                    alignItems={'center'}
                  >
                    <Typography marginRight={0.5}>{account?.accAddress}</Typography>
                    <CopyIcon />
                  </Typography>
                </Typography>
              </Button>
            }
            size={260}
            url={`${networkName?.toLowerCase()}:${account?.accAddress}?type=${
              account?.connectName
            }&action=HebaoAddGuardian`}
          />
        }
      />
      <GuardianModal
        open={showLockWallet}
        onClose={() => onOpenLockWallet(false)}
        title={
          <Typography component={'p'} textAlign={'center'} marginBottom={1}>
            <Typography
              color={'var(--color-text-primary)'}
              component={'p'}
              variant={'h4'}
              marginBottom={2}
            >
              {t('labelWalletLockTitle')}
            </Typography>
            <Typography
              color={'var(--color-text-secondary)'}
              component={'p'}
              variant={'body1'}
              marginBottom={2}
            >
              {t('labelWalletLockDes')}
            </Typography>
          </Typography>
        }
        body={
          <WalletProtector
            guardianConfig={guardianConfig}
            loadData={loadData}
            handleOpenModal={handleOpenModal}
            protectorList={protectList}
          />
        }
      />
      <GuardianModal
        open={showApprovalRequests}
        onClose={() => onOpenApprovalRequests(false)}
        title={
          <Typography component={'p'} textAlign={'center'} marginBottom={1}>
            <Typography
              color={'var(--color-text-primary)'}
              component={'p'}
              variant={'h4'}
              marginBottom={2}
            >
              {t('labelWalletValidationTitle')}
            </Typography>
            <Typography
              color={'var(--color-text-secondary)'}
              component={'p'}
              variant={'body1'}
              marginBottom={2}
            >
              {t('labelWalletValidationDes')}
            </Typography>
          </Typography>
        }
        body={
          <WalletValidationInfo
            isContractAddress={isContractAddress}
            loadData={loadData}
            guardianConfig={guardianConfig}
            handleOpenModal={handleOpenModal}
            guardiansList={guardiansList}
          />
        }
      />
      <GuardianModal
        open={showHistory}
        onClose={() => onOpenHistory(false)}
        title={
          <Typography component={'p'} textAlign={'center'} marginBottom={1}>
            <Typography
              color={'var(--color-text-primary)'}
              component={'p'}
              variant={'h4'}
              marginBottom={2}
            >
              {t('labelWalletHistoryTitle')}
            </Typography>
          </Typography>
        }
        body={<WalletHistory operationLogList={operationLogList} />}
      />
      <ModalLock
        options={openHebao.options ?? {}}
        open={openHebao.isShow}
        step={openHebao.step}
        handleOpenModal={handleOpenModal}
        onClose={() => {
          setOpenHebao({
            isShow: false,
            step: GuardianStep.LockAccount_WaitForAuth,
          })
        }}
      />
      <ContainerStyled marginTop={2}>
        <Section
          onClick={() => {
            loadData()
            onOpenAdd(true)
          }}
          title={'Set as Guardian'}
          logo={
            <RoundAddIcon
              htmlColor='var(--color-text-primary)'
              style={{
                width: 'var(--svg-size-huge)',
                height: 'var(--svg-size-huge)',
              }}
            />
          }
        />
        <Section
          description={'Who I Protect'}
          onClick={() => {
            loadData()
            onOpenLockWallet(true)
          }}
          title={'Lock/unlock Wallet'}
          logo={
            <LockGuardianIcon
              htmlColor='var(--color-text-primary)'
              style={{
                width: 'var(--svg-size-huge)',
                height: 'var(--svg-size-huge)',
              }}
            />
          }
        />
        <Section
          description={'Guardian Request Handling'}
          onClick={() => {
            loadData()
            onOpenApprovalRequests(true)
          }}
          title={'Approve Requests'}
          logo={
            <ApprovalIcon
              htmlColor='var(--color-text-primary)'
              style={{
                width: 'var(--svg-size-huge)',
                height: 'var(--svg-size-huge)',
              }}
            />
          }
        />
        <Section
          description={'Guardian Handling Records'}
          onClick={() => {
            loadData()
            onOpenHistory(true)
          }}
          title={'View History'}
          logo={
            <ViewHistoryIcon
              htmlColor='var(--color-text-primary)'
              style={{
                width: 'var(--svg-size-huge)',
                height: 'var(--svg-size-huge)',
              }}
            />
          }
        />
      </ContainerStyled>
    </>
  )
})
