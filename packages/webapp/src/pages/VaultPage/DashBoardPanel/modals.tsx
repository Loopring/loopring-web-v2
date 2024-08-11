import { Box, Typography, Modal, Divider, IconButton, Slider, Checkbox, Tooltip } from '@mui/material'
import { AvatarCoin, Button, CoinIcons, SpaceBetweenBox } from '@loopring-web/component-lib'
import { BackIcon, CheckBoxIcon, CheckedIcon, CloseIcon, EmptyValueTag, Info2Icon, OrderListIcon, TokenType } from '@loopring-web/common-resources'
import { numberFormat } from '@loopring-web/core'
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import _ from 'lodash';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

type CollateralDetailsModalProps = {
  open: boolean
  onClose: () => void
  onClickMaxCredit: () => void
  collateralTokens: {
    name: string
    logo: string
    amount: string
    valueInCurrency: string
  }[]
  totalCollateral: string
  maxCredit: string
  coinJSON: any
}

export const CollateralDetailsModal = (props: CollateralDetailsModalProps) => {
  const { open, onClose, collateralTokens, totalCollateral, maxCredit,onClickMaxCredit,coinJSON } = props
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'600px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
        >
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant={'h5'}>Collateral Details</Typography>
            <CloseIcon
              style={{
                height: '20px',
                width: '20px',
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                marginRight: 1.5,
                color: 'var(--color-text-third)',
              }}
              onClick={onClose}
            />
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3}>
            <Box
              marginTop={4}
              padding={2.5}
              bgcolor={'var(--color-box-secondary)'}
              borderRadius={'8px'}
            >
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-third)'}>Total Collateral</Typography>
                }
                rightNode={<Typography>{totalCollateral}</Typography>}
              />
              <SpaceBetweenBox
                marginTop={2}
                leftNode={<Typography color={'var(--color-text-third)'}>Maximum Credit</Typography>}
                rightNode={<Typography>{maxCredit}</Typography>}
              />
            </Box>
            <Typography
              marginBottom={3}
              marginTop={2}
              variant='body2'
              color={'var(--color-text-secondary)'}
            >
              Maximum Credit means the maximum amount of money you can borrow from Portal based on
              your collateral. It is calculated by taking the total value of your collateral,
              adjusted for price factor and the maximum leverage.
              <Typography
                component={'span'}
                onClick={onClickMaxCredit}
                variant='body2'
                color={'var(--color-primary)'}
                sx={{ cursor: 'pointer' }}
              >
                Learn More
              </Typography>
            </Typography>
            {collateralTokens.map((token) => {
              return (
                <Box
                  borderRadius={'8px'}
                  border={'1px solid var(--color-border)'}
                  paddingX={2}
                  paddingY={1.5}
                  marginBottom={2}
                  key={token.name}
                >
                  <SpaceBetweenBox
                    alignItems={'center'}
                    leftNode={
                      <Box display={'flex'} alignItems={'center'}>
                        {/* <Box
                          component={'img'}
                          src={token.logo}
                          width={32}
                          height={32}
                          marginRight={1}
                        /> */}
                        <CoinIcons  type={TokenType.single} tokenIcon={[coinJSON]}/>
                        <Typography marginLeft={1}>{token.name}</Typography>
                      </Box>
                    }
                    rightNode={
                      <Box>
                        <Typography textAlign={'right'}>{token.amount}</Typography>
                        <Typography
                          color={'var(--color-text-secondary)'}
                          textAlign={'right'}
                          variant={'subtitle2'}
                        >
                          {token.valueInCurrency}
                        </Typography>
                      </Box>
                    }
                  />
                </Box>
              )
            })}
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
type MaximumCreditModalProps = {
  open: boolean
  onClose: () => void
  onClickBack: () => void
  collateralFactors: {
    name: string
    collateralFactor: string
  }[]
  maxLeverage: string
}
export const MaximumCreditModal = (props: MaximumCreditModalProps) => {
  const { open, onClose, onClickBack, collateralFactors, maxLeverage } = props
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'600px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
        >
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Box display={'flex'} alignItems={'center'}>
              <BackIcon sx={{ marginRight: 2,cursor: 'pointer' }} onClick={onClickBack}/>
              <Typography variant={'h5'}>Maximum Credit</Typography>
            </Box>
            <CloseIcon
              style={{
                height: '20px',
                width: '20px',
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                marginRight: 1.5,
                color: 'var(--color-text-third)',
              }}
              onClick={onClose}
            />
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3}>
            <Typography
              marginTop={2}
              marginBottom={2}
              variant='body2'
              color={'var(--color-text-secondary)'}
            >
              Maximum Credit means the maximum amount of money you can borrow from Portal based on
              your collateral. It is calculated by taking the total value of your collateral,
              adjusted for price factor and the maximum leverage.
            </Typography>
            <Typography marginBottom={2} variant='body2' color={'var(--color-text-secondary)'}>
              Maximum Credit = Sum ( Token_MarketPrice * Token_Amount * Token_PriceFactor ) *
              Maximum_Leverage
            </Typography>
            <Typography color={'var(--color-text-secondary)'} variant='h5'>
              The Price Factor of each collateral
            </Typography>
            <Box
              marginTop={2}
              marginBottom={3}
              padding={2.5}
              bgcolor={'var(--color-box-secondary)'}
              borderRadius={'8px'}
            >
              {collateralFactors.map((collateralFactor, index) => {
                return (
                  <SpaceBetweenBox
                    key={collateralFactor.name}
                    marginTop={index === 0 ? 0 : 2}
                    leftNode={
                      <Typography color={'var(--color-text-third)'}>
                        {collateralFactor.name}
                      </Typography>
                    }
                    rightNode={<Typography>{collateralFactor.collateralFactor}</Typography>}
                  />
                )
              })}
            </Box>
            <Typography marginBottom={2} color={'var(--color-text-secondary)'} variant='h5'>
              Maximum Leverage
            </Typography>
            <Box
              padding={2.5}
              bgcolor={'var(--color-box-secondary)'}
              borderRadius={'8px'}
            >
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-third)'}>Maximum Leverage</Typography>
                }
                rightNode={<Typography>{maxLeverage}x</Typography>}
              />
            </Box>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

type LeverageModalProps = {
  open: boolean
  maxLeverage: number
  onClose: () => void
  onClickMaxCredit: () => void
  onClickReduce: () => void
  onClickAdd: () => void
  onClickLeverage: (leverage: number) => void
  currentLeverage: number | undefined
  borrowAvailable: string
  borrowed: string
  maximumCredit: string
}

export const LeverageModal = (props: LeverageModalProps) => {
  const {
    open,
    onClose,
    onClickMaxCredit,
    currentLeverage,
    onClickReduce,
    onClickAdd,
    maxLeverage,
    onClickLeverage,
    borrowAvailable,
  borrowed,
  maximumCredit,
  } = props
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'620px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
        >
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant={'h5'}>Leverage</Typography>
            <CloseIcon
              style={{
                height: '20px',
                width: '20px',
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                marginRight: 1.5,
                color: 'var(--color-text-third)',
              }}
              onClick={onClose}
            />
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3}>
            <Box
              borderRadius={'4px'}
              padding={1}
              justifyContent={'space-between'}
              marginTop={4}
              marginBottom={2.5}
              display={'flex'}
              bgcolor={'var(--color-box-secondary)'}
              alignItems={'center'}
            >
              <IconButton onClick={onClickReduce}>
                <RemoveIcon
                  sx={{
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    fontSize: '16px',
                  }}
                />
              </IconButton>

              <Typography>
                {currentLeverage
                  ? `${numberFormat(currentLeverage, { fixed: 1 })}x`
                  : EmptyValueTag}
              </Typography>
              <IconButton onClick={onClickAdd}>
                <AddIcon
                  sx={{
                    cursor: 'pointer',
                    color: 'var(--color-text-secondary)',
                    fontSize: '16px',
                  }}
                />
              </IconButton>
            </Box>
            <Box sx={{ width: '100%' }}>
              <Slider
                aria-label='Always visible'
                value={currentLeverage ? (currentLeverage / maxLeverage) * 100 : 0}
                step={maxLeverage}
                onChange={(_, _value) => {
                  const value = _value as number
                  const leverage = value / 100 * maxLeverage
                  onClickLeverage(leverage)
                }}
                marks={_.range(0, maxLeverage).map((number) => ({
                  value: (number / maxLeverage) * 100,
                  label: number === 0 ? '' : `${number}x`,
                }))}
              />
            </Box>
            <Box
              marginTop={2}
              marginBottom={3}
              padding={2.5}
              bgcolor={'var(--color-box-secondary)'}
              borderRadius={'8px'}
            >
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>Available Borrow</Typography>
                }
                rightNode={<Typography>{borrowAvailable}</Typography>}
                marginBottom={2}
              />
              <SpaceBetweenBox
                leftNode={<Typography color={'var(--color-text-secondary)'}>Borrowed</Typography>}
                rightNode={<Typography>{borrowed}</Typography>}
                marginBottom={2}
              />
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>Maximum Credit</Typography>
                }
                rightNode={<Typography>{maximumCredit}</Typography>}
              />
            </Box>
            <Typography
              marginBottom={3}
              marginTop={3}
              variant='body2'
              color={'var(--color-text-secondary)'}
            >
              Maximum Credit means the maximum amount of money you can borrow from Portal based on
              your collateral. It is calculated by taking the total value of your collateral,
              adjusted for price factor and the maximum leverage.
              <Typography
                component={'span'}
                onClick={onClickMaxCredit}
                variant='body2'
                color={'var(--color-primary)'}
                sx={{ cursor: 'pointer' }}
              >
                Learn More
              </Typography>
            </Typography>
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3} marginTop={3}>
            <Typography marginBottom={2} variant='body2' color={'var(--color-text-secondary)'}>
              {' '}
              · Selecting higher leverage will increase your liquidation risk.
            </Typography>
            <Typography marginBottom={2} variant='body2' color={'var(--color-text-secondary)'}>
              {' '}
              · Available Borrow is based on the upper limit corresponding to the leverage you
              choose. The total value of all your borrowed tokens will not exceed Available Borrow.
            </Typography>
            <Typography marginBottom={2} variant='body2' color={'var(--color-text-secondary)'}>
              {' '}
              · Maximum Credit is the maximum amount you can borrow based on your collateral.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

type DebtModalProps = {
  open: boolean
  onClose: () => void
  borrowedVaultTokens?: {
    symbol: string,
    amount: string,
    valueInCurrency: string
    coinJSON: any
    onClick: () => void
  }[]
  totalFundingFee: string
  totalBorrowed: string
  totalDebt: string
}

export const DebtModal = (props: DebtModalProps) => {
  const {
    open,
    onClose,
    borrowedVaultTokens,
    totalFundingFee,
    totalBorrowed,
    totalDebt,
  } = props
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'620px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
        >
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant={'h5'}>Debt</Typography>
            <CloseIcon
              style={{
                height: '20px',
                width: '20px',
              }}
              sx={{
                cursor: 'pointer',
                fontSize: '24px',
                marginRight: 1.5,
                color: 'var(--color-text-third)',
              }}
              onClick={onClose}
            />
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3}>
            <Box
              borderRadius={'8px'}
              padding={2}
              // justifyContent={'space-between'}
              marginTop={4}
              marginBottom={2}
              // display={'flex'}
              bgcolor={'var(--color-box-secondary)'}
              // alignItems={'center'}
            >
              <Typography marginBottom={2} fontSize={'16px'}>Details</Typography>
              <SpaceBetweenBox
                marginBottom={2}
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>
                    Total Debt
                  </Typography>
                }
                rightNode={
                  <Typography>
                    {totalDebt}
                  </Typography>
                }
              />
              <SpaceBetweenBox
                marginBottom={2}
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>
                    Total Borrowed
                  </Typography>
                }
                rightNode={
                  <Typography>
                    {totalBorrowed}
                  </Typography>
                }
              />
              <SpaceBetweenBox
                leftNode={
                  <Typography color={'var(--color-text-secondary)'}>
                    Total Funding Fee
                  </Typography>
                }
                rightNode={
                  <Typography>
                    {totalFundingFee}
                  </Typography>
                }
              />
            </Box>  
            <Typography fontSize={'16px'} marginBottom={2}>Borrowed</Typography>
          </Box>
          <Divider style={{ width: '100%' }} />
          <Box paddingX={3} marginTop={3}>
            {borrowedVaultTokens?.map(token => {
              return (
                <SpaceBetweenBox
                  key={token.symbol}
                  marginBottom={2}
                  paddingX={2}
                  paddingY={1.5}
                  borderRadius={'8px'}
                  border={'1px solid var(--color-border)'}
                  alignItems={'center'}
                  sx={{
                    cursor: 'pointer'
                  }}
                  onClick={token.onClick}
                  leftNode={
                    <Box display={'flex'} alignItems={'center'}>
                      <CoinIcons type={TokenType.vault} tokenIcon={[token.coinJSON]} />
                      <Typography marginLeft={1}>{token.symbol}</Typography>
                    </Box>
                  }
                  rightNode={
                    <Box display={'flex'} alignItems={'center'}>
                      <Box marginRight={1}>
                        <Typography textAlign={'right'}>{token.amount}</Typography>
                        <Typography
                          color={'var(--color-text-secondary)'}
                          textAlign={'right'}
                          variant={'subtitle2'}
                        >
                          {token.valueInCurrency}
                        </Typography>
                      </Box>
                      <ArrowForwardIosIcon sx={{ color: 'var(--color-text-primary)' }} />
                    </Box>
                  }
                />
              )
            })}
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}

type DustCollectorProps = {
  open: boolean
  onClose: () => void
  dusts?: {
    symbol: string
    amount: string
    valueInCurrency
    checked: boolean
    coinJSON: any
    onCheck: () => void
  }[]
  totalValueInUSDT: string
  totalValueInCurrency: string
  onClickConvert: () => void
  onClickRecords: () => void
  convertBtnDisabled: boolean
}

export const DustCollectorModal = (props: DustCollectorProps) => {
  const {
    open,
    onClose,
    dusts,
    totalValueInUSDT,
    totalValueInCurrency,
    onClickConvert,
    convertBtnDisabled,
    onClickRecords,
  } = props
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'500px'}
          borderRadius={1}
          display={'flex'}
          flexDirection={'column'}
        >
          <Box
            paddingX={1.5}
            paddingY={1.5}
            display={'flex'}
            justifyContent={'space-between'}
            alignItems={'center'}
          >
            <Typography variant={'h5'}>Dust Collector</Typography>
            <Box>
              <OrderListIcon
                style={{
                  height: '20px',
                  width: '20px',
                }}
                sx={{
                  cursor: 'pointer',
                  marginRight: 1.5,
                  color: 'var(--color-text-third)',
                }}
                onClick={onClickRecords}
              />
              <CloseIcon
                style={{
                  height: '20px',
                  width: '20px',
                }}
                sx={{
                  cursor: 'pointer',
                  marginRight: 1.5,
                  color: 'var(--color-text-third)',
                }}
                onClick={onClose}
              />
            </Box>
          </Box>
          <Divider style={{ marginTop: '-1px', width: '100%' }} />
          <Box paddingX={3} paddingTop={5} paddingBottom={4}>
            {dusts?.map((dust) => {
              return (
                <SpaceBetweenBox
                  key={dust.symbol}
                  leftNode={
                    <Box display={'flex'} alignItems={'center'}>
                      <Checkbox
                        checked={dust.checked}
                        checkedIcon={<CheckedIcon />}
                        icon={<CheckBoxIcon />}
                        color='default'
                        onChange={dust.onCheck}
                      />
                      <CoinIcons type={TokenType.vault} tokenIcon={[dust.coinJSON]} />
                      <Typography sx={{ marginLeft: 1 }}>{dust.symbol}</Typography>
                    </Box>
                  }
                  rightNode={
                    <Box>
                      <Typography textAlign={'right'}>{dust.amount}</Typography>
                      <Typography
                        color={'var(--color-text-secondary)'}
                        textAlign={'right'}
                        variant={'subtitle2'}
                      >
                        {dust.valueInCurrency}
                      </Typography>
                    </Box>
                  }
                />
              )
            })}
          </Box>
          <Divider style={{ width: '100%' }} />
          <Box paddingX={3}>
            <SpaceBetweenBox
              marginTop={3}
              leftNode={
                <Typography display={'flex'} alignItems={'center'} color={'var(--color-text-third)'}>
                  Value (est.)
                  <Tooltip
                    title={
                      'The token price changes dynamically, the dust value you see here may be inconsistent with the final value.'
                    }
                    placement={'top'}
                  >
                    <IconButton>
                      <Info2Icon sx={{ color: 'var(--color-text-secondary)',marginLeft: 1 / 2 }} />
                    </IconButton>
                    
                  </Tooltip>
                </Typography>
              }
              rightNode={
                <Typography>
                  {totalValueInUSDT} / {totalValueInCurrency}
                </Typography>
              }
            />
            <Typography marginBottom={2} color={'var(--color-text-secondary)'} marginTop={5}>
              The accumulated dust will be converted into corresponding USDT. If you do not have any
              USDT to be repaid, the converted amount will be deposited into your portal's USDT.
              However, if you have USDT to be repaid, the converted amount will be prioritized to
              repay the debt. 
            </Typography>
            <Button
              sx={{ marginBottom: 4 }}
              disabled={convertBtnDisabled}
              fullWidth
              onClick={onClickConvert}
              variant={'contained'}
            >
              Convert
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  )
}
