import {
  CloseIcon,
  ContactIcon,
  Info2Icon,
  SearchIcon,
  TokenType,
} from '@loopring-web/common-resources'
import { Box, Button, Input, Tooltip, Typography } from '@mui/material'
import { SpaceBetweenBox } from '../../basic-lib'
import { TransferToTaikoAccountProps } from '../../../components/tradePanel'
import { CoinIcons } from '../../tableList'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { FeeSelectModal } from './FeeSelect'
import { ContactSelection } from '../../tradePanel/components/ContactSelection'

export const TransferToTaikoAccount = (props: TransferToTaikoAccountProps) => {
  const {
    onClickContact,
    balance,
    fee,
    onClickFee,
    onClickSend,
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
  } = props
  const mainPanel = (
    <>
      <Box>
        <Typography variant={'h3'} textAlign={'center'}>
          Send to Taiko Account
          <Tooltip sx={{ ml: 1 }} title={'todo'}>
            <Info2Icon />
          </Tooltip>
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
              fontSize: '16px',
            }}
            placeholder='Recipient'
            disableUnderline
            fullWidth
            endAdornment={
              <ContactIcon
                onClick={onClickContact}
                className='custom-size'
                sx={{ fontSize: '24px', width: '24px', height: '24px', cursor: 'pointer' }}
              />
            }
            onInput={(e: any) => onInputAddress(e.target.value)}
            value={receiptInput}
          />
        </Box>
      </Box>
      <Box>
        <SpaceBetweenBox
          leftNode={<Typography color={'var(--color-text-primary)'}>Network Fee</Typography>}
          rightNode={
            <Typography
              color={'var(--color-text-primary)'}
              sx={{ cursor: 'pointer' }}
              onClick={onClickFee}
            >
              {fee} {'>'}
            </Typography>
          }
        />
        <Button onClick={onClickSend} variant='contained' fullWidth sx={{ mt: 3 }}>
          Send
        </Button>
      </Box>
    </>
  )
  const tokenSelectPanel = (
    <Box mt={2}>
      <Box my={1.5} display={'flex'} alignItems={'center'}>
        <Input
          value={tokenSelection.filter}
          onChange={(e) => tokenSelection.onChangeFilter(e.target.value)}
          endAdornment={tokenSelection.filter ? <Box component={'span'} onClick={tokenSelection.onClickClearFilter}>x</Box> : <></>}
          placeholder='Search'
          startAdornment={<SearchIcon sx={{mr: 1}} />}
          sx={{ width: '94%',px:1 , bgcolor: 'var(--field-opacity)' }}
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
    <Box
      display={'flex'}
      flexDirection={'column'}
      justifyContent={'space-between'}
      width={'var(--modal-width)'}
      height={'500px'}
      px={panel === 'tokenSelection' ? 2.5 : 5}
      pb={5}
    >
      {panel === 'main' ? mainPanel : panel === 'tokenSelection' ? tokenSelectPanel : <ContactSelection {...contacts} />}

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
  )
}
