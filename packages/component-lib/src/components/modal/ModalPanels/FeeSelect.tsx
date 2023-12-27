import {Box, BoxProps, Divider, Typography} from '@mui/material'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import {
  BackIcon,
  EmptyValueTag,
  LoadingIcon,
  RoundCheckIcon,
  RoundCircleIcon,
  myLog,
} from '@loopring-web/common-resources'
import { FeeSelectProps, Modal } from '../../../components/tradePanel'
import { CoinIcon } from '../../../components/basic-lib'
import { OffchainFeeReqType, toBig } from '@loopring-web/loopring-sdk'


const OptionStyled = styled(Box)<{ checked?: boolean; disabled?: boolean }>`
  border: 1px solid;
  border-color: ${({ checked }) => (checked ? 'var(--color-primary)' : 'var(--color-border)')};
  width: 100%;
  display: flex;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.unit}px;
  padding: ${({ theme }) => theme.unit * 1.5}px ${({ theme }) => theme.unit * 2}px;
  min-height: ${({ theme }) => theme.unit * 8}px;
  align-items: center;
  cursor: pointer;
  opacity: ${({ disabled }) => (disabled ? '0.5' : '1')};
`

type OptionType = { checked?: boolean; disabled?: boolean } & BoxProps

const Option = (props: OptionType) => {
  const { checked, disabled, children, ...otherProps } = props
  return (
    <OptionStyled disabled={disabled} checked={checked} {...otherProps}>
      {children}
      {checked ? (
        <RoundCheckIcon fontSize={'large'} fill={'var(--color-primary)'} />
      ) : (
        <RoundCircleIcon fontSize={'large'} />
      )}
    </OptionStyled>
  )
}
const FeeTypeStyled = styled(Box)<{ checked?: boolean }>`
  border: 1px solid;
  border-color: ${({ checked }) => (checked ? 'var(--color-primary)' : 'var(--color-border)')};
  display: flex;
  justify-content: space-between;
  border-radius: ${({ theme }) => theme.unit}px;
  padding: ${({ theme }) => theme.unit * 0.5}px ${({ theme }) => theme.unit * 1.5}px;
  align-items: center;
  cursor: pointer;
  margin-right: ${({ theme }) => 2 * theme.unit}px;
`

const BackIconStyled = styled(BackIcon)`
  transform: rotate(180deg);
`

export const FeeSelect = (props: FeeSelectProps) => {
  const {
    open,
    chargeFeeTokenList,
    disableNoToken,
    feeInfo: selectedFeeInfo,
    handleToggleChange,
    onClose,
    withdrawInfos,
    onClickFee,
    isFeeNotEnough,
    feeLoading,
    isFastWithdrawAmountLimit,
    floatLeft,
    middleContent,
    feeNotEnoughContent,
  } = props

  const { t } = useTranslation()
  return (
    <>
      <Typography
        component={'span'}
        display={'flex'}
        flexWrap={'wrap'}
        alignItems={'center'}
        variant={'body1'}
        color={'var(--color-text-secondary)'}
        marginBottom={1}
        justifyContent={floatLeft ? 'left' : 'space-between'}
      >
        <Typography
          marginRight={floatLeft ? 1 : 0}
          component={'span'}
          color={'inherit'}
          minWidth={28}
        >
          {t('labelL2toL2Fee')}:
        </Typography>
        <Box
          component={'span'}
          display={'flex'}
          alignItems={'center'}
          style={{ cursor: 'pointer' }}
          onClick={() => onClickFee()}
        >
          <Typography marginRight={0.5} color={'var(--color-text-second)'}>
            {withdrawInfos &&
              withdrawInfos.types &&
              (withdrawInfos.type === OffchainFeeReqType.OFFCHAIN_WITHDRAWAL
                ? t('labelL2toL1Standard')
                : withdrawInfos.type === OffchainFeeReqType.FAST_OFFCHAIN_WITHDRAWAL
                ? t('labelL2toL1Fast')
                : '')}
          </Typography>
          {isFeeNotEnough ? (
            feeNotEnoughContent ? (
              feeNotEnoughContent
            ) : (
              <Typography component={'span'} color={'var(--color-error)'}>
                {t('labelL2toL2FeeNotEnough')}
              </Typography>
            )
          ) : feeLoading ? (
            <LoadingIcon fontSize={'medium'} htmlColor={'var(--color-text-primary)'}></LoadingIcon>
          ) : isFastWithdrawAmountLimit ? (
            <Typography marginLeft={1} component={'span'} color={'var(--color-error)'}>
              {t('labelL2toL2FeeFastNotAllowEnough')}
            </Typography>
          ) : selectedFeeInfo && selectedFeeInfo.belong && selectedFeeInfo.fee ? (
            selectedFeeInfo.fee + ' ' + selectedFeeInfo.belong
          ) : (
            EmptyValueTag + ' ' + selectedFeeInfo?.belong ?? EmptyValueTag
          )}
          <BackIconStyled fontSize={'medium'} />
        </Box>
      </Typography>
      {middleContent}
      <Modal
        open={open}
        onClose={() => {
          onClose()
        }}
        content={
          <Box
             marginTop={'-40px'}
             width={'var(--modal-width)'}>
            <Typography
              component={'header'}
              height={'var(--toolbar-row-height)'}
              display={'flex'}
              paddingX={3}
              justifyContent={'flex-start'}
              flexDirection={'row'}
              alignItems={'center'}
            >
              <Typography variant={'h4'} component={'span'} display={'inline-flex'} color={'textPrimary'}>
	              {t('labelFee')}
              </Typography>
            </Typography>
            <Divider />
            <Box width={'100%'}  marginY={3} paddingX={3} >
              {withdrawInfos && (
                <Box marginBottom={3} display={'flex'}>
                  {Object.keys(withdrawInfos.types).map((key) => {
                    const type = Number(key)
                    return (
                      <FeeTypeStyled
                        onClick={() => {
                          withdrawInfos.onChangeType(Number(key))
                        }}
                        checked={withdrawInfos.type === type}
                        key={key}
                      >
                        <Typography>{t('withdrawTypeLabel' + withdrawInfos.types[key])}</Typography>
                      </FeeTypeStyled>
                    )
                  })}
                </Box>
              )}
              {chargeFeeTokenList.map((feeInfo, index) => {
                const inefficient =
                  !feeInfo.count ||
                  toBig(feeInfo.count).isZero() ||
                  toBig(feeInfo.count).lt(feeInfo.fee ?? '0')
                const disabled = (disableNoToken && !feeInfo.hasToken) || inefficient
                myLog('inefficient', feeInfo.belong, inefficient)
                return (
                  <Option
                    disabled={disabled}
                    marginBottom={2}
                    checked={selectedFeeInfo?.belong == feeInfo.belong}
                    onClick={() => {
                      if (!disabled) {
                        handleToggleChange(feeInfo)
                      }
                    }}
                  >
                    <Box display={'flex'}>
                      <CoinIcon size={32} symbol={feeInfo.belong} />
                      <Box marginLeft={1}>
                        <Typography>
                          {feeInfo.belong}{' '}
                          {feeInfo.discount && feeInfo.discount !== 1 && (
                            <Typography
                              marginLeft={0.5}
                              component={'span'}
                              borderRadius={0.5}
                              paddingX={0.5}
                              bgcolor={'var(--color-warning)'}
                            >
                              {Math.round((1 - feeInfo.discount) * 100)}% OFF
                            </Typography>
                          )}
                        </Typography>
                        <Typography variant={'body2'} color={'var(--color-text-secondary)'}>
                          {t('labelFeeAvailablePay', {
                            available: feeInfo.count ? feeInfo.count : '0.00',
                            pay: feeInfo.fee,
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Option>
                )
              })}
            </Box>
          </Box>
        }
      />
    </>
  )
}
