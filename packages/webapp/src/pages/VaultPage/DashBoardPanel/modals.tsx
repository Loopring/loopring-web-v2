import { Box, Typography, Modal, Divider } from '@mui/material'
import { SpaceBetweenBox } from '@loopring-web/component-lib'
import { BackIcon, CloseIcon } from '@loopring-web/common-resources'

type CollateralDetailsModalProps = {
  open: boolean
  onClose: () => void
  collateralTokens: {
    name: string
    logo: string
    amount: string
    valueInUSD: string
  }[]
  totalCollateral: string
  maxCredit: string
}

export const CollateralDetailsModal = (props: CollateralDetailsModalProps) => {
  const { open, onClose, collateralTokens, totalCollateral, maxCredit } = props
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'550px'}
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
                onClick={() => {
                  // todo onclick
                }}
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
                    leftNode={
                      <Box display={'flex'} alignItems={'center'}>
                        <Box
                          component={'img'}
                          src={token.logo}
                          width={32}
                          height={32}
                          marginRight={1}
                        />
                        <Typography>{token.name}</Typography>
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
                          {token.valueInUSD}
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
  maxLeverage: number
}
export const MaximumCreditModal = (props: MaximumCreditModalProps) => {
  const { open, onClose,onClickBack, collateralFactors, maxLeverage } = props
  return (
    <Modal open={open} onClose={onClose}>
      <Box height={'100%'} display={'flex'} justifyContent={'center'} alignItems={'center'}>
        <Box
          bgcolor={'var(--color-box)'}
          width={'var(--modal-width)'}
          height={'550px'}
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
