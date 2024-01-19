import { Box, Modal, Typography } from '@mui/material'
import * as sdk from '@loopring-web/loopring-sdk'
import { Trans, useTranslation } from 'react-i18next'
import React from 'react'
import {
  Button,
  EmptyDefault,
  GuardianStep,
  InputCode,
  ModalCloseButton,
  SwitchPanelStyled,
} from '@loopring-web/component-lib'

import { useAction } from './hook'

const VCODE_UNIT = 6
export const WalletValidationInfo = ({
  guardiansList,
  loadData,
  guardianConfig,
  isContractAddress,
  handleOpenModal,
}: {
  guardiansList: sdk.Guardian[]
  guardianConfig: any
  isContractAddress: boolean
  loadData: () => Promise<void>
  handleOpenModal: (props: { step: GuardianStep; options?: any }) => void
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
