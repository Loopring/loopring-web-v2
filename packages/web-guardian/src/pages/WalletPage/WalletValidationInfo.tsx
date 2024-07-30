import { Box, IconButton, Input, Modal, Typography } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'
import { Trans, useTranslation } from 'react-i18next'
import React, { useMemo } from 'react'
import {
  Button,
  EmptyDefault,
  GuardianStep,
  InputCode,
  ModalCloseButton,
  QRCodeV2,
  SwitchPanelStyled,
} from '@loopring-web/component-lib'
import { useAction } from './hook'
import { useTheme } from '@emotion/react'
import { CopyIcon, ScanQRIcon, SoursURL } from '@loopring-web/common-resources'
import { createImageFromInitials, shortenAddress } from '@loopring-web/core'
import QRCodeStyling from 'qr-code-styling'
import { decodeData, encodeData } from './utils'

const VCODE_UNIT = 6
export const WalletValidationInfo = ({
  guardiansList,
  loadData,
  guardianConfig,
  isContractAddress,
  handleOpenModal,
  onClickScan,
  codeText,
  onInputCode,
  onClickNext,
  onClickCodeApprovalApprove,
  onClickCodeApprovalReject,
  approvalCodeStatus,
  guardianSign,
  codeInputError,
  nextBtnDisabled,
  guardian
}: {
  guardiansList: sdk.Guardian[]
  guardianConfig: any
  isContractAddress: boolean
  loadData: () => Promise<void>
  handleOpenModal: (props: { step: GuardianStep; options?: any }) => void
  onClickScan: () => void
  codeText: string
  onInputCode: (str: string) => void
  onClickNext: () => void
  onClickCodeApprovalApprove: () => void
  onClickCodeApprovalReject: () => void
  approvalCodeStatus: 'init' | 'confirmation' | 'sharing'
  guardianSign?: string
  guardian: string
  codeInputError?: string
  nextBtnDisabled: boolean
}) => {
  const { t } = useTranslation()
  const [selected, setSelected] = React.useState<sdk.Guardian | undefined>()
  const [openCode, setOpenCode] = React.useState(false)
  const { submitApprove, handleReject, handleOpenApprove } = useAction({
    setSelected,
    setOpenCode,
    loadData,
    guardianConfig,
    isContractAddress,
    handleOpenModal,
  })
  const theme = useTheme()
  const sharingStr = useMemo(() => {
    return approvalCodeStatus === 'sharing' && guardianSign
      ? encodeData({ ...decodeData(codeText), guardian, guardianSign })
      : undefined
  }, [approvalCodeStatus === 'sharing', guardianSign, codeText])

  if (approvalCodeStatus === 'confirmation') {
    const jsonObj = decodeData(codeText)

    return (
      <Box>
        <Typography variant={'body2'}>{t('labelGuardianCodeRequestedWallet')}</Typography>
        <Box marginTop={1.5} display={'flex'} alignItems={'center'}>
          <Box
            marginRight={1.5}
            borderRadius={'14px'}
            src={createImageFromInitials(28, 'O', theme.colorBase.success)}
            component={'img'}
          />
          <Box>
            <Typography>{t('labelGuardianCodeOwner')}</Typography>
            <Typography variant={'body2'} color={theme.colorBase.textSecondary}>
              {jsonObj?.sender}
            </Typography>
          </Box>
        </Box>
        <Box marginTop={1.5} display={'flex'} justifyContent={'space-between'}>
          <Typography variant={'body2'}>{t('labelGuardianCodeRequestType')}</Typography>
          <Typography variant={'body2'} color={theme.colorBase.textPrimary}>
            {jsonObj.metaTxType === 16
              ? 'Recover Wallet'
              : jsonObj.metaTxType === 34
              ? 'Add Guardian'
              : jsonObj.metaTxType === 35
              ? 'Remove Guardian'
              : jsonObj.metaTxType === 18
              ? 'Transfer'
              : jsonObj.metaTxType === 23
              ? 'Approve Token'
              : jsonObj.metaTxType === 201
              ? 'Change Master Copy'
              : jsonObj.metaTxType === 202
              ? 'Call Contract'
              : 'Unknown'}
          </Typography>
        </Box>
        <Box marginTop={1.5} display={'flex'} justifyContent={'space-between'}>
          <Typography variant={'body2'}>{t('labelGuardianCodeNetwork')}</Typography>
          <Typography variant={'body2'} color={theme.colorBase.textPrimary}>
            {jsonObj?.network.toUpperCase()}
          </Typography>
        </Box>
        <Typography variant={'body2'} marginTop={3}>
          {t('labelGuardianCodeConfirmationDes')}
        </Typography>
        <Box marginTop={8} display={'flex'} justifyContent={'center'} paddingX={8}>
          <Button
            onClick={onClickCodeApprovalReject}
            variant={'contained'}
            sx={{ width: '150px', height: '52px', marginRight: 8 }}
          >
            {t('labelGuardianCodeReject')}
          </Button>
          <Button
            onClick={onClickCodeApprovalApprove}
            variant={'contained'}
            sx={{ width: '150px', height: '52px' }}
          >
            {t('labelGuardianCodeApprove')}
          </Button>
        </Box>
      </Box>
    )
  } else if (approvalCodeStatus === 'sharing') {
    const jsonObj = decodeData(codeText)
    // const guardianSign = '0xaa' // todo
    return (
      <Box display={'flex'} alignItems={'center'} flexDirection={'column'}>
        <Typography marginBottom={1} variant={'h3'} textAlign={'center'}>
          Share Approval Code
        </Typography>
        <Box
          borderRadius={'12px'}
          paddingX={2}
          paddingTop={4}
          paddingBottom={2}
          width={'312px'}
          bgcolor={theme.colorBase.box}
          display={'flex'}
          alignItems={'center'}
          flexDirection={'column'}
        >
          <Typography textAlign={'center'}>{t('labelGuardianCodeSharingDes')}</Typography>
          <Box width={200} marginTop={1.5} height={200}>
            {sharingStr && (
              <QRCodeV2
                options={{
                  data: sharingStr,
                  width: 200,
                  height: 200,
                  imageOptions: {
                    imageSize: 0.1,
                  },
                  image: `${SoursURL + 'svg/loopring.svg'}`,
                }}
              />
            )}{' '}
          </Box>
          <Typography marginTop={1.5} textAlign={'center'}>
            {t('labelGuardianCodeSharingApprovalRequest')}
          </Typography>
          <Typography
            variant={'body2'}
            marginTop={0.5}
            textAlign={'center'}
            color={theme.colorBase.textSecondary}
            display={'flex'}
            alignItems={'center'}
          >
            {sharingStr ? sharingStr.slice(0, 15) + '...' + sharingStr.slice(-15) : ''}
            {sharingStr && (
              <CopyIcon
                sx={{ marginLeft: 0.5, cursor: 'pointer' }}
                onClick={() => {
                  navigator.clipboard.writeText(sharingStr)
                }}
              />
            )}
          </Typography>
          <Box width={'100%'} marginTop={2.5} display={'flex'} justifyContent={'space-between'}>
            <Typography variant={'body2'}>{t('labelGuardianCodeRequestType')}</Typography>
            <Typography variant={'body2'} color={theme.colorBase.textPrimary}>
              {jsonObj.metaTxType === 16
                ? 'Recover Wallet'
                : jsonObj.metaTxType === 34
                ? 'Add Guardian'
                : jsonObj.metaTxType === 35
                ? 'Remove Guardian'
                : jsonObj.metaTxType === 18
                ? 'Transfer'
                : jsonObj.metaTxType === 23
                ? 'Approve Token'
                : jsonObj.metaTxType === 201
                ? 'Change Master Copy'
                : jsonObj.metaTxType === 202
                ? 'Call Contract'
                : 'Unknown'}
            </Typography>
          </Box>
          <Box width={'100%'} marginTop={2} display={'flex'} justifyContent={'space-between'}>
            <Typography variant={'body2'}>{t('labelGuardianCodeNetwork')}</Typography>
            <Typography variant={'body2'} color={theme.colorBase.textPrimary}>
              {jsonObj?.network.toUpperCase()}
            </Typography>
          </Box>
          <Box width={'100%'} marginTop={2} display={'flex'} justifyContent={'space-between'}>
            <Typography variant={'body2'}>{t('labelGuardianCodeRequester')}</Typography>
            <Typography variant={'body2'} color={theme.colorBase.textPrimary}>
              {jsonObj?.sender ? shortenAddress(jsonObj?.sender) : ''}
            </Typography>
          </Box>
          <Box width={'100%'} marginTop={2} display={'flex'} justifyContent={'space-between'}>
            <Typography variant={'body2'}>{t('Authorization Result')}</Typography>
            <Typography variant={'body2'} color={theme.colorBase.textPrimary}>
              {t('Approved')}
            </Typography>
          </Box>
          {/* <Typography marginTop={1.5}>Please send the QR code to the requester.</Typography> */}
        </Box>
        <Button
          variant={'contained'}
          sx={{
            marginTop: 2,
            marginBottom: 2,
            width: '312px',
          }}
          onClick={() => {
            new QRCodeStyling({
              data: sharingStr,
              width: 200,
              height: 200,
              imageOptions: {
                imageSize: 0.1,
              },
              image: `${SoursURL + 'svg/loopring.svg'}`,
            }).download()
          }}
        >
          {t('labelGuardianCodeShare')}
        </Button>
      </Box>
    )
  }
  return (
    <>
      <Modal open={openCode} onClose={() => setOpenCode(false)}>
        <SwitchPanelStyled>
          <Box display={'flex'} flexDirection={'column'}>
            <ModalCloseButton onClose={() => setOpenCode(false)} t={t as any} />
            <Typography component={'p'} textAlign={'center'} marginBottom={2} paddingX={2}>
              <Typography
                color={'var(--color-text-primary)'}
                component={'p'}
                variant={'h4'}
                marginBottom={2}
              >
                {t('labelWalletInputGuardianCode')}
              </Typography>
              <Typography
                color={'var(--color-text-secondary)'}
                component={'p'}
                variant={'body1'}
                marginBottom={2}
              >
                {t('labelWalletInputGuardianCodeDes')}
              </Typography>
            </Typography>
            <Box paddingBottom={3}>
              <Box display={'flex'} alignItems={'center'} justifyContent={'center'}>
                <InputCode
                  length={VCODE_UNIT}
                  onComplete={(code) => submitApprove(code, selected!)}
                  loading={false}
                />
              </Box>
              <Box display={'flex'} marginTop={4} marginX={2} justifyContent={'center'}>
                <Button
                  fullWidth
                  variant={'contained'}
                  size={'small'}
                  color={'primary'}
                  onClick={() => setOpenCode(false)}
                >
                  <Typography paddingX={2}> {t('labelCancel')}</Typography>
                </Button>
              </Box>
            </Box>
          </Box>
        </SwitchPanelStyled>
      </Modal>
      <Box marginTop={5} marginBottom={10}>
        <Typography variant='h4'>{t('labelGuardianCodeEnterApprovalCode')}</Typography>
        <Box display={'flex'} marginTop={1.5}>
          <Input
            placeholder={t('labelGuardianCodeEnterApprovalCodeHint')}
            sx={{
              bgcolor: theme.colorBase.white,
              flex: '1 1 auto',
              height: '52px',
              borderRadius: '8px',
              paddingX: 2,
              color: theme.colorBase.black,
            }}
            endAdornment={
              <IconButton onClick={onClickScan} size={'large'}>
                <ScanQRIcon />
              </IconButton>
            }
            value={codeText}
            onChange={(e) => onInputCode(e.target.value)}
          />
        </Box>
        <Typography
          marginTop={0.5}
          visibility={codeInputError ? 'visible' : 'hidden'}
          variant={'body2'}
          color={theme.colorBase.error}
        >
          {codeInputError ?? '-'}
        </Typography>
        <Box width={'100%'} display={'flex'} justifyContent={'center'}>
          <Button
            sx={{
              width: '30%',
              height: '48px',
              minWidth: '312px',
              marginTop: 3,
            }}
            variant={'contained'}
            onClick={onClickNext}
            disabled={nextBtnDisabled}
          >
            {t('labelGuardianCodeNext')}
          </Button>
        </Box>
      </Box>
      {guardiansList.length !== 0 ? (
        <Box height={'320px'} overflow='scroll'>
          {guardiansList.map((guardian, index) => {
            return (
              <Box
                key={guardian.address + index}
                display={'flex'}
                alignItems={'center'}
                justifyContent={'space-between'}
                marginBottom={2}
              >
                <Box>
                  <Typography variant={'body1'}>
                    <Trans
                      i18nKey={'labelWalletSignType'}
                      tOptions={{ type: t('labelTxGuardian_' + guardian.type) }}
                    >
                      Request for {guardian?.type?.replace('_', ' ').toUpperCase() ?? 'Unknown'}
                    </Trans>
                  </Typography>
                  <Typography variant={'body1'}>
                    {guardian.ens ? `${guardian.ens} /` : ''}
                    <Typography
                      title={guardian.address}
                      component={'span'}
                      color={'var(--color-text-third)'}
                    >
                      {guardian.address &&
                        `${guardian.address.slice(0, 6)}...${guardian.address.slice(
                          guardian.address.length - 4,
                        )}`}
                    </Typography>
                  </Typography>
                </Box>
                <Box>
                  <Box display={'inline-block'} marginRight={2}>
                    <Button
                      variant={'outlined'}
                      size={'medium'}
                      onClick={() => {
                        handleOpenApprove(guardian)
                      }}
                    >
                      {t('labelApprove')}
                    </Button>
                  </Box>
                  <Button
                    onClick={() => handleReject(guardian)}
                    variant={'outlined'}
                    size={'medium'}
                  >
                    Reject
                  </Button>
                </Box>
              </Box>
            )
          })}
        </Box>
      ) : (
        <Box flex={1} height={'100%'} width={'100%'}>
          <EmptyDefault
            style={{ alignSelf: 'center' }}
            height={'100%'}
            message={() => (
              <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                {t('labelNoContent')}
              </Box>
            )}
          />
        </Box>
      )}
    </>
  )
}
