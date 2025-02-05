import {
  AlertIcon,
  BackIcon,
  CloseIcon,
  ContactIcon,
  hexToRGB,
  Info2Icon,
  SearchIcon,
  TokenType,
} from '@loopring-web/common-resources'

import { Box, Button, Input, Tooltip, Typography, Modal } from '@mui/material'
import { ModalCloseButton, SpaceBetweenBox } from '../../basic-lib'
import { TransferToTaikoAccountProps } from '../../../components/tradePanel'
import { CoinIcons } from '../../tableList'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { FeeSelectModal } from './FeeSelect'
import { ContactSelection } from '../../tradePanel/components/ContactSelection'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { useTheme } from '@emotion/react'

const formatTokenList = (tokens: string[]):string => {
  if (!tokens || tokens.length === 0) return '';
  if (tokens.length === 1) return tokens[0];
  if (tokens.length === 2) return `${tokens[0]} and ${tokens[1]}`;
  
  const lastToken = tokens[tokens.length - 1];
  const otherTokens = tokens.slice(0, -1);
  return `${otherTokens.join(', ')}, and ${lastToken}`;
}

export const TransferToTaikoAccountModal = (props: TransferToTaikoAccountProps) => {
  const {
    onClickContact,
    balance,
    fee,
    onClickFee,
    onInputAmount,
    onInputAddress,
    token,
    onClickToken,
    onClickBalance,
    feeSelect,
    contacts,
    panel,
    tokenSelection,
    receiptInput,
    amountInput,
    onClickBack,
    onClickClose,
    open,
    supportedTokens,
    sendBtn,
    maxAlert,
    receiptError,
    receiptClear,
    showReceiptWarning,
    onClickConfirm
  } = props

  const theme = useTheme();
  const mainPanel = (
    <>
      <Box>
        <Typography variant={'h3'} textAlign={'center'}>
          Send to Taiko
        </Typography>
        <Box mt={6}>
          <SpaceBetweenBox
            mb={0.5}
            leftNode={
              <Typography fontSize={'14px'} color={'var(--color-text-third)'}>
                Select Token
              </Typography>
            }
            rightNode={
              <Typography
                component={'p'}
                onClick={onClickBalance}
                sx={{ textDecoration: 'underline', cursor: 'pointer' }}
                fontSize={'14px'}
                color={'var(--color-text-secondary)'}
              >
                Balance {balance}
              </Typography>
            }
          />
          <Input
            sx={{
              height: '48px',
              bgcolor: 'var(--color-bg-secondary)',
              textAlign: 'right',
              px: 2,
              fontSize: '20px',
            }}
            placeholder='0.00'
            disableUnderline
            fullWidth
            startAdornment={
              <Box
                display={'flex'}
                alignItems={'center'}
                component={'div'}
                sx={{ cursor: 'pointer' }}
                onClick={onClickToken}
              >
                <CoinIcons type={TokenType.single} tokenIcon={[token.coinJSON]} />
                <Typography ml={0.5} fontSize={'16px'} color={'var(--color-text-primary)'}>
                  {token.symbol}
                </Typography>
                <KeyboardArrowDownIcon
                  sx={{ ml: 0.5, color: 'var(--color-text-secondary)' }}
                ></KeyboardArrowDownIcon>
              </Box>
            }
            inputProps={{ sx: { textAlign: 'right' } }}
            onInput={(e: any) => onInputAmount(e.target.value)}
            value={amountInput}
          />
          <Typography
            sx={{
              opacity: maxAlert.show ? 1 : 0,
              textAlign: 'right',
              color: 'var(--color-error)',
              fontSize: '12px',
              mt: -1,
            }}
          >
            {maxAlert.message || '--'}
          </Typography>
        </Box>
        <Box mt={3}>
          <Typography mb={0.5} color={'var(--color-text-third)'}>
            Recipient
          </Typography>
          <Input
            sx={{
              height: '48px',
              bgcolor: 'var(--color-bg-secondary)',
              textAlign: 'right',
              px: 2,
              fontSize: '14px',
            }}
            placeholder='Recipient'
            disableUnderline
            fullWidth
            endAdornment={
              <Box display={'flex'} alignItems={'center'}>
                {receiptClear.show && (
                  <CloseIcon
                    onClick={receiptClear.onClick}
                    className='custom-size'
                    sx={{
                      fontSize: '16px',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer',
                      color: 'var(--color-text-third)',
                      mr: 1,
                    }}
                  />
                )}
                <ContactIcon
                  onClick={onClickContact}
                  className='custom-size'
                  sx={{ fontSize: '24px', width: '24px', height: '24px', cursor: 'pointer' }}
                />
              </Box>
            }
            onInput={(e: any) => onInputAddress(e.target.value)}
            value={receiptInput}
          />
          {receiptError.show && (
            <Typography
              sx={{
                opacity: true ? 1 : 0,
                textAlign: 'left',
                color: 'var(--color-error)',
                fontSize: '12px',
                mt: 0.5,
              }}
            >
              {receiptError.message}
            </Typography>
          )}
          {showReceiptWarning && (
            <Typography
              marginTop={2}
              variant={'body1'}
              component={'span'}
              p={1}
              px={2}
              display={'inline-flex'}
              bgcolor={hexToRGB(theme.colorBase.warning, 0.2)}
              borderRadius={'4px'}
              color={'var(--color-warning)'}
              fontSize={'12px'}
            >
              <AlertIcon color={'warning'} sx={{ marginRight: 1 / 2 }} />
              Please ensure that the recipient's address is capable of properly receiving the
              assets.
            </Typography>
          )}
        </Box>
        <Typography mt={3} color={'var(--color-text-third)'} fontSize={'12px'}>
          Trust Mode: Operated by Loopring's team to maintain liquidity.
          <br />
          Supported Assets: {formatTokenList(supportedTokens)}.
        </Typography>
      </Box>

      <Box>
        <SpaceBetweenBox
          leftNode={<Typography color={'var(--color-text-primary)'}>Transaction Cost</Typography>}
          rightNode={
            <Typography
              color={'var(--color-text-primary)'}
              sx={{ cursor: 'pointer' }}
              onClick={onClickFee}
              display={'flex'}
              alignItems={'center'}
            >
              {feeSelect.feeLoading ? (
                <Typography color={'var(--color-warning)'}>calculating</Typography>
              ) : feeSelect.isFeeNotEnough ? (
                <Typography color={'var(--color-error)'}>insufficient</Typography>
              ) : (
                fee
              )}
              {fee !== '--' && (
                <ArrowForwardIosIcon sx={{ fontSize: '14px', mb: '1px' }} className='custom-size' />
              )}
            </Typography>
          }
        />
        <Button
          disabled={sendBtn.disabled}
          onClick={sendBtn.onClick}
          variant='contained'
          fullWidth
          sx={{ mt: 3 }}
        >
          {sendBtn.text || 'Send'}
        </Button>
      </Box>
    </>
  )
  const confirmPanel = (
    <Box display={'flex'} justifyContent={'space-between'} flexDirection={'column'}>
      <Typography variant={'h3'} textAlign={'center'}>
        Send to Taiko
      </Typography>
      <Box mt={6} mb={4}>
        <Box mb={4}>
          <Typography color={'var(--color-text-third)'}>Token Amount</Typography>
          <Typography mt={1} color={'var(--color-text-primary)'}>{amountInput} {token.symbol}</Typography>
        </Box>
        <Box mb={4}>
          <Typography color={'var(--color-text-third)'}>Recipient</Typography>
          <Typography mt={1} color={'var(--color-text-primary)'}>{receiptInput}</Typography>
        </Box>
        <Box mb={4}>
          <Typography color={'var(--color-text-third)'}>Fee</Typography>
          <Typography mt={1} color={'var(--color-text-primary)'}>{feeSelect.feeInfo?.count} {feeSelect.feeInfo?.belong}</Typography>
        </Box>
      </Box>

      <Button
        onClick={onClickConfirm}
        variant='contained'
        fullWidth
        sx={{ mt: 3 }}
      >
        Confirm
      </Button>
    </Box>
  )
  const tokenSelectPanel = (
    <Box mt={2}>
      <Box my={1.5} display={'flex'} alignItems={'center'}>
        <Input
          value={tokenSelection.filter}
          onChange={(e) => tokenSelection.onChangeFilter(e.target.value)}
          endAdornment={
            tokenSelection.filter ? (
              <Box component={'span'} onClick={tokenSelection.onClickClearFilter}>
                x
              </Box>
            ) : (
              <></>
            )
          }
          placeholder='Search'
          startAdornment={<SearchIcon sx={{ mr: 1 }} />}
          sx={{ width: '94%', px: 1, bgcolor: 'var(--field-opacity)' }}
          disableUnderline
        />
        <Typography
          width={'16%'}
          component={'span'}
          onClick={tokenSelection.onClickCancel}
          textAlign={'right'}
          sx={{ cursor: 'pointer' }}
        >
          Cancel
        </Typography>
      </Box>
      <Box>
        {tokenSelection.tokens.map((token) => {
          return (
            <SpaceBetweenBox
              alignItems={'center'}
              key={token.symbol}
              py={1}
              px={2.5}
              mx={-2.5}
              sx={{
                ':hover': {
                  bgcolor: 'var(--color-box-hover)',
                },
                cursor: 'pointer',
              }}
              onClick={() => tokenSelection.onClickToken(token.symbol)}
              leftNode={
                <Box display={'flex'} alignItems={'center'}>
                  <CoinIcons type={TokenType.single} tokenIcon={token.coinJSON as any} />
                  <Typography ml={1} fontSize={'14px'} color={'var(--color-text-primary)'}>
                    {token.symbol}
                  </Typography>
                </Box>
              }
              rightNode={
                <Typography
                  component={'p'}
                  sx={{ cursor: 'pointer' }}
                  fontSize={'14px'}
                  color={'var(--color-text-secondary)'}
                >
                  {token.amount}
                </Typography>
              }
            />
          )
        })}
      </Box>
    </Box>
  )

  return (
    <Modal
      open={open}
      onClose={onClickClose}
      aria-labelledby='modal-modal-title'
      aria-describedby='modal-modal-description'
    >
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box bgcolor={'var(--color-box)'}>
          <Box
            display={'flex'}
            width={'100%'}
            justifyContent={'space-between'}
            mt={3}
            px={3}
            mb={1.5}
          >
            <BackIcon
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                color: 'var(--color-text-secondary)',
              }}
              className='custom-size'
              onClick={onClickBack}
            />
            <CloseIcon
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                color: 'var(--color-text-secondary)',
              }}
              className='custom-size'
              onClick={onClickClose}
            />
          </Box>
          <Box
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'space-between'}
            width={'var(--modal-width)'}
            height={'500px'}
            px={panel === 'tokenSelection' ? 2.5 : 4}
            pb={4}
          >
            {panel === 'main' ? (
              mainPanel
            ) : panel === 'tokenSelection' ? (
              tokenSelectPanel
            ) : panel === 'confirm' ? (
              confirmPanel
            ) : (
              <ContactSelection {...contacts} scrollHeight='388px' />
            )}

            <FeeSelectModal
              open={feeSelect.open}
              onClose={feeSelect.onClose}
              chargeFeeTokenList={feeSelect.chargeFeeTokenList}
              feeInfo={feeSelect.feeInfo}
              handleToggleChange={feeSelect.handleToggleChange}
              disableNoToken={feeSelect.disableNoToken}
              withdrawInfos={feeSelect.withdrawInfos}
            />
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
