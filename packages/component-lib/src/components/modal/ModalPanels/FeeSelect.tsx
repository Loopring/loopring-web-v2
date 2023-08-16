import {
  Box,
  BoxProps,
  Typography,
} from '@mui/material'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'
import {
  BackIcon,
  EmptyValueTag,
  LoadingIcon,
  RoundCheckIcon,
  RoundCircle,
} from '@loopring-web/common-resources'
import { FeeSelectProps, Modal } from '../../../components/tradePanel'
import { CoinIcon } from '../../../components/basic-lib'

const BoxStyled = styled(Box)`` as typeof Box

const OptionStyled = styled(Box)<{ checked?: boolean }>`
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
`

type OptionType = { checked?: boolean; disabled?: boolean } & BoxProps

const Option = (props: OptionType) => {
  const { checked, children, ...otherProps } = props
  return (
    <OptionStyled checked={checked} {...otherProps}>
      {children}
      {checked ? (
        <RoundCheckIcon fontSize={'large'} fill={'var(--color-primary)'} />
      ) : (
        <RoundCircle fontSize={'large'} />
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
    feeNotEnoughContent
  } = props

  const {t} = useTranslation()
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
          <BoxStyled
            flex={1}
            display={'flex'}
            alignItems={'center'}
            justifyContent={'space-between'}
            flexDirection={'column'}
            width={'var(--modal-width)'}
          >
            <Typography marginBottom={3} variant={'h3'}>
              {t("labelFee")}
            </Typography>

            <Box width={'100%'} paddingX={5} marginBottom={10}>
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
                return (
                  <Option
                    disabled={disableNoToken && !feeInfo.hasToken}
                    marginBottom={2}
                    checked={selectedFeeInfo?.belong == feeInfo.belong}
                    onClick={() => handleToggleChange(feeInfo)}
                  >
                    <Box display={'flex'}>
                      <CoinIcon size={32} symbol={feeInfo.belong} />
                      <Box marginLeft={1}>
                        <Typography>{feeInfo.belong}</Typography>
                        <Typography variant={'body2'} color={'var(--color-text-secondary)'}>
                          {t("labelFeeAvailablePay", {
                            available: feeInfo.count ? feeInfo.count : "0.00",
                            pay: feeInfo.fee
                          })}
                        </Typography>
                      </Box>
                    </Box>
                  </Option>
                )
              })}
            </Box>
          </BoxStyled>
        }
      />
    </>
  )
}
