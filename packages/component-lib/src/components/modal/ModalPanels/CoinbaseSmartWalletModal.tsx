import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  IconButton,
  Input,
  InputAdornment,
  Modal,
  OutlinedInput,
  Typography,
} from '@mui/material'
import styled from '@emotion/styled'
import { ModalCloseButton } from '../../basic-lib'
import { withTranslation } from 'react-i18next'
import { AccountStep } from './Interface'
import { useOpenModals } from '../../../stores'
import React from 'react'
import { CheckIcon, CloseIcon, hexToRGB, LoadingIcon, LoadingIcon2, SoursURL } from '@loopring-web/common-resources'
import { keyframes } from '@emotion/react'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import Visibility from '@mui/icons-material/Visibility'
import VisibilityOff from '@mui/icons-material/VisibilityOff'
import { range } from 'lodash'

// 创建旋转动画
const spin = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

// 旋转的LoadingIcon2组件
const RotatingLoadingIcon = styled(LoadingIcon2)`
  animation: ${spin} 1.5s linear infinite;
  transform-origin: center;
`

// 步骤指示器组件定义
enum StepStatus {
  INIT = 'init',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
}

interface Step {
  rightElement: React.ReactNode
}

interface VerticalStepperProps {
  steps: Step[]
  currentStep: number
}

const StepperContainer = styled(Box)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
`

const StepCircle = styled(Box)<{ status: StepStatus }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ status, theme }) => 
    status === StepStatus.COMPLETED 
      ? hexToRGB(theme.colorBase.success, 0.1) 
      : hexToRGB(theme.colorBase.boxSecondary, 1)};
  color: var(--color-text-button);
  svg {
    height: 24px;
    width: 24px;
  }
`

const ConnectingLine = styled(Box)<{ isActive: boolean }>`
  width: 2px;
  position: absolute;
  background: ${({ isActive }) => 
    isActive ? 
    `repeating-linear-gradient(
      to bottom,
      var(--color-success),
      var(--color-success) 4px,
      transparent 4px,
      transparent 8px
    )` : 
    `repeating-linear-gradient(
      to bottom,
      var(--field-opacity),
      var(--field-opacity) 4px,
      transparent 4px,
      transparent 8px
    )`
  };
`

const VerticalStepper: React.FC<VerticalStepperProps> = ({ 
  steps,
  currentStep, 
}) => {
  const circleRefs = React.useRef<(HTMLDivElement | null)[]>([]);

  circleRefs.current = circleRefs.current.slice(0, steps.length);
  const positions = (() => {
    const positions = circleRefs.current.map((ref) => {
      if (!ref) return null;
      const containerRect = ref.parentElement!.getBoundingClientRect()
      const rect = ref.getBoundingClientRect();
      return {
        x: rect.left - containerRect.left,
        y: rect.top - containerRect.top,
      };
    });
    return positions;
  })();


  return (
    <StepperContainer position={'relative'}>
      {steps.map((step, index) => {
        const status = currentStep > index ? StepStatus.COMPLETED : currentStep === index ? StepStatus.PROCESSING : StepStatus.INIT
        return (
          <Box ref={(el: HTMLDivElement | null) => {
            circleRefs.current[index] = el
          }} key={index} width={'100%'}>
            <Box display={'flex'} alignItems={'start'}>
            <StepCircle
              status={status}
            >
              {status === StepStatus.COMPLETED ? (
                <CheckIcon
                  className='custom-size'
                  sx={{ fontSize: '24px', color: 'var(--color-success)' }}
                />
              ) : status === StepStatus.PROCESSING ? (
                <RotatingLoadingIcon className='custom-size' sx={{ fontSize: '24px' }} />
              ) : (
                <></>
              )}
            </StepCircle>
            <Box mt={1} width={'calc(100% - 80px)'}>
              {step.rightElement}
            </Box>
          </Box>
        </Box>
      )})}
      {range(0, steps.length - 1).map((index) => (
        <React.Fragment key={index}>
          {index < steps.length - 1 && positions && positions[index] && positions[index + 1] && (
            <ConnectingLine
              isActive={currentStep > index}
              sx={{
                left: `${23 + (positions[index]?.x || 0)}px`,
                top: `${(positions[index]?.y || 0) + 52}px`,
                height: `${
                  (positions[index + 1]?.y || 0) - (positions[index]?.y || 0) - 56
                }px`,
                zIndex: 0,
              }}
            />
          )}
        </React.Fragment>
      ))}
    </StepperContainer>
  )
}






const Coinbase_Smart_Wallet_Password_Intro = withTranslation('common')(
  ({ t, onClickConfirm }: { t: any; onClickConfirm: () => void }) => {
    return (
      <Box px={3} display={'flex'} flexDirection={'column'} height={'100%'} pb={4}>
        {/* <ModalCloseButton onClose={onClickClose} t={t} /> */}

        <Typography variant='h4' textAlign='center'>
          Sign-In Password Required for <br/> Coinbase Smart Wallet
        </Typography>

        <Box width='100%' marginTop={5}>
          <Typography color='var(--color-text-secondary)' textAlign='left'>
            Coinbase Smart Wallet detected.
            <br />
            To use Loopring DeFi securely, you’ll need to set a password to locally encrypt your
            EDDSA signature.
            <br />
            When you close the Loopring dApp and return later, you’ll be required to sign in with
            your password to continue.
          </Typography>
        </Box>

        <Box mt={'auto'} width={'100%'} pt={4}>
          <Button
          variant='contained'
          fullWidth
          size='medium'
          onClick={() => {
            onClickConfirm()
          }}
        >
          {t('labelConfirm')}
        </Button>
        </Box>
      </Box>
    )
  },
)

const isValidPassword = (password: string): boolean => {
  const hasValidLength = password.length >= 6 && password.length <= 20;
  
  const hasLetters = /[a-zA-Z]/.test(password);
  
  const hasNumbers = /[0-9]/.test(password);

  const onlyLetterOrNumber = /^[a-zA-Z0-9]+$/.test(password);
  
  return hasValidLength && hasLetters && hasNumbers && onlyLetterOrNumber;
}

const Coinbase_Smart_Wallet_Password_Set = withTranslation('common')(
  ({ t, onClickConfirm, onClickBack }: {
    t: any
    onClickConfirm: (pwd: string) => void
    onClickBack: () => void
  }) => {
    const [password, setPassword] = React.useState('')
    const [confirmPassword, setConfirmPassword] = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)
    
    const error =
      password && !isValidPassword(password)
        ? 'format'
        : confirmPassword && password !== confirmPassword
        ? 'notMatch'
        : undefined
    
    const handleToggleShowPassword = () => {
      setShowPassword(!showPassword)
    }

    const handleConfirm = () => {
      onClickConfirm(password)
    }

    return (
      <Box px={3} display={'flex'} flexDirection={'column'} height={'100%'} pb={3}>
        <ArrowBackIosNewIcon
          sx={{
            position: 'absolute',
            left: 24,
            top: 24,
            cursor: 'pointer',
            fontSize: '20px',
            color: 'var(--color-text-secondary)',
          }}
          className='custom-size'
          onClick={onClickBack}
        />
        <Typography variant='h4' textAlign='center' mt={2}>
            Set Password
        </Typography>
        <Box mt={4}>
          <Typography variant='body1' color='var(--color-text-secondary)' mb={1}>
            Set Password
          </Typography>
          <FormControl variant='outlined' fullWidth>
            <Input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endAdornment={
                showPassword ? (
                  <VisibilityOff
                    sx={{
                      cursor: 'pointer',
                      fontSize: '20px',
                      mr: 1,
                    }}
                    className='custom-size'
                    onClick={handleToggleShowPassword}
                  />
                ) : (
                  <Visibility
                    sx={{
                      cursor: 'pointer',
                      fontSize: '20px',
                      mr: 1,
                    }}
                    className='custom-size'
                    onClick={handleToggleShowPassword}
                  />
                )
              }
              sx={{
                backgroundColor: 'transparent',
                border: '1px solid var(--color-border)',
                borderRadius: '8px',
                height: '48px',
                fontSize: '20px',
                pl: 1.5,
              }}
              disableUnderline
            />
          </FormControl>
          <Typography
            mt={1.5}
            variant='body1'
            color={error === 'format' ? 'var(--color-error)' : 'var(--color-text-secondary)'}
            mb={1}
          >
            *6–20 chars, letters + numbers
          </Typography>
        </Box>

        <Box mt={3}>
          <Typography variant='body1' color='var(--color-text-secondary)' mb={1}>
            Confirm Password
          </Typography>
          <FormControl variant='outlined' fullWidth>
            <Input
              disableUnderline
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              sx={{
                backgroundColor: 'transparent',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                height: '48px',
                fontSize: '20px',
                pl: 1.5,
              }}
            />
          </FormControl>
          <Typography
            mt={1.5}
            variant='body1'
            sx={{ opacity: error === 'notMatch' ? 1 : 0 }}
            color={'var(--color-error)'}
            mb={1}
          >
            Not match
          </Typography>
        </Box>

        <Box mt={'auto'} width={'100%'}>
          <Button
            variant='contained'
            fullWidth
            size='medium'
            onClick={handleConfirm}
            disabled={!password || !confirmPassword || !!error}
          >
            {t('labelConfirm')}
          </Button>
        </Box>
      </Box>
    )
  },
)

const Coinbase_Smart_Wallet_Password_Input = withTranslation('common')(
  ({ t, onClickConfirm, onClickForgetPassword, inputDisabled, showPasswordMismatchError, onInputPassword }: {
    t: any
    onClickConfirm: (pwd: string) => void
    onClickForgetPassword: () => void
    inputDisabled?: boolean
    showPasswordMismatchError: boolean
    onInputPassword: () => void
  }) => {
    const [password, setPassword] = React.useState('')
    const [showPassword, setShowPassword] = React.useState(false)

    const handleToggleShowPassword = () => {
      setShowPassword(!showPassword)
    }

    const handleConfirm = () => {
      onClickConfirm(password)
    }

    return (
      <Box px={3} display={'flex'} flexDirection={'column'} height={'100%'} pb={3}>
        <Typography variant='h4' textAlign='center' mb={4}>
          {t('labelSignIn')}
        </Typography>

        <Box>
          {!inputDisabled && (
            <>
              <Typography variant='body1' color='var(--color-text-secondary)' mb={1}>
                Input Password
              </Typography>
              <FormControl variant='outlined' fullWidth>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    onInputPassword()
                  }}
                  endAdornment={
                    showPassword ? (
                      <VisibilityOff
                        sx={{
                          cursor: 'pointer',
                          fontSize: '20px',
                          mr: 1,
                        }}
                        className='custom-size'
                        onClick={handleToggleShowPassword}
                      />
                    ) : (
                      <Visibility
                        sx={{
                          cursor: 'pointer',
                          fontSize: '20px',
                          mr: 1,
                        }}
                        className='custom-size'
                        onClick={handleToggleShowPassword}
                      />
                    )
                  }
                  sx={{
                    backgroundColor: 'transparent',
                    border: '1px solid var(--color-border)',
                    borderRadius: '8px',
                    height: '48px',
                    fontSize: '16px',
                    pl: 2,
                  }}
                  disableUnderline
                />
              </FormControl>
              {showPasswordMismatchError && (
                <Typography mt={1.5} variant='body1' color='var(--color-error)'>
                  Authentication failed: password mismatch
                </Typography>
              )}
            </>
          )}
          {inputDisabled && (
            <Typography mt={1.5} variant='body1' color='var(--color-error)' mb={1}>
              No corresponding password found, please reset password
            </Typography>
          )}
        </Box>

        <Box mt={'auto'} width={'100%'}>
          <Typography
            variant='body2'
            onClick={onClickForgetPassword}
            sx={{
              cursor: 'pointer',
              color: 'var(--color-primary)',
              textAlign: 'center',
              mb: 1.5,
            }}
          >
            Forget Password?
          </Typography>
          <Button
            variant='contained'
            fullWidth
            size='medium'
            onClick={handleConfirm}
            disabled={!password}
          >
            {t('labelConfirm')}
          </Button>
        </Box>
      </Box>
    )
  },
)

const Coinbase_Smart_Wallet_Password_Forget_Password = withTranslation('common')(
  ({ t, onClickConfirm }: {
    t: any
    onClickConfirm: () => void
  }) => {
    return (
      <Box px={3} display={'flex'} flexDirection={'column'} height={'100%'} pb={3}>
        <Box display={'flex'} justifyContent={'center'} my={2}>
          <Box component={'img'} width={86}  src={SoursURL + 'images/coinbase_reset_password.png'} />
        </Box>
        <Typography variant='h4' textAlign='center' mt={2} mb={1}>
          Reset Loopring DeFi Account & Password
        </Typography>
        <Typography textAlign='center' color='var(--color-text-secondary)' mb={3}>
          Resetting your password requires resetting your Loopring DeFi Account.
        </Typography>

        <Box>
          
          
          <Typography color='var(--color-text-third)' fontSize={13} mb={3}>
            Please note: this operation will not affect your assets - only your EDDSA key will be replaced with a new one.
          </Typography>
          
          <Typography color='var(--color-text-third)' fontSize={13} mb={3}>
            This process requires confirmation via your wallet. Please approve the signature request in your wallet to proceed.
          </Typography>
        </Box>

        <Box mt={'auto'} width={'100%'}>
          <Button
            variant='contained'
            fullWidth
            size='medium'
            onClick={onClickConfirm}
          >
            Confirm
          </Button>
        </Box>
      </Box>
    )
  },
)


const Coinbase_Smart_Wallet_Password_Forget_Password_Confirm = withTranslation('common')(
  ({ t, onClickConfirm, onClickBack }: {
    t: any
    onClickConfirm: () => void
    onClickBack: () => void
  }) => {
    const [isAcknowledged, setIsAcknowledged] = React.useState(false)

    return (
      <Box px={3} display={'flex'} flexDirection={'column'} height={'100%'} pb={3}>
        <ArrowBackIosNewIcon
          sx={{
            position: 'absolute',
            left: 24,
            top: 24,
            cursor: 'pointer',
            fontSize: '20px',
            color: 'var(--color-text-secondary)',
          }}
          className='custom-size'
          onClick={onClickBack}
        />
        <Box display={'flex'} justifyContent={'center'} my={2}>
          <Box component={'img'}width={86}  src={SoursURL + 'images/coinbase_forget_password.png'} />
        </Box>
        
        <Typography variant='h4' textAlign='center' mt={2} mb={1}>
          Forget Password
        </Typography>
        <Typography color='var(--color-text-secondary)' textAlign='center' mb={4}>
        You will need to reset your Loopring DeFi account.
        </Typography>

        <Box>
          <Typography color='var(--color-text-third)' fontSize={13} mb={2}>
            
            Please note:<br />
            · Any active positions (such as trades in the Loopring Portal) will be automatically closed upon reset.<br />
            · If you have pending Dual Investment positions, you must wait for them to settle before you can reset your account.<br /><br />

            For assistance during the reset process, please contact: support@loopring.io
          </Typography>

          <Box
            display='flex'
            alignItems='center'
            mb={2}
            sx={{ cursor: 'pointer' }}
            onClick={() => setIsAcknowledged(!isAcknowledged)}
          >
            <Box
              sx={{
                width: 16,
                height: 16,
                border: '1px solid var(--color-border)',
                borderRadius: '2px',
                mr: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isAcknowledged ? 'var(--color-primary)' : 'transparent',
              }}
            >
              {isAcknowledged && (
                <Typography component='span' sx={{ fontSize: '12px', color: 'white' }}>
                  ✓
                </Typography>
              )}
            </Box>
            <Typography color='var(--color-primary)'>
              I acknowledge and would like to proceed.
            </Typography>
          </Box>
        </Box>

        <Box mt={'auto'} width={'100%'}>
          <Button
            variant='contained'
            fullWidth
            size='medium'
            onClick={onClickConfirm}
            disabled={!isAcknowledged}
          >
            {t('labelConfirm')}
          </Button>
        </Box>
      </Box>
    )
  },
)

const Coinbase_Smart_Wallet_Password_Set_Processing = withTranslation('common')(
  ({ step, showResumeUpdateAccount }: { step: 'keyGenerating' | 'blockConfirming' | 'updatingAccount' | 'completed'; showResumeUpdateAccount: boolean }) => {
    return (
      <Box px={3} display={'flex'} flexDirection={'column'} height={'100%'} pb={3}>
        <Typography variant='h4' textAlign='center' mb={4} mt={2}>
          Loopring DeFi Account Creation
        </Typography>
        
        <Box display='flex' alignItems='flex-start' mb={4} gap={3}>
          <Box mt={2}>
            <VerticalStepper
              steps={[
                {
                  rightElement: (
                    <Typography variant='h4' ml={2}>
                      Sign In & Generate EDDSA Key
                    </Typography>
                  ),
                },
                {
                  rightElement: (
                    <Box ml={2}>
                      <Typography variant='h4' mb={1}>
                        Submit EDDSA Key & Wait for Block Confirmation
                      </Typography>
                      <Typography variant='body1' color='var(--color-text-secondary)'>
                      It requires a certain number of block confirmations. The dApp will automatically monitor the progress and proceed to Step 3 once confirmations are complete.
                      </Typography>
                    </Box>
                  ),
                },
                {
                  rightElement: (
                    <Typography variant='h4' ml={2}>
                       Update Account
                    </Typography>
                  ),
                },
              ]}
              currentStep={step === 'keyGenerating' ? 0 : step === 'blockConfirming' ? 1 : step === 'updatingAccount' ? 2 : 3}
            />
          </Box>
        </Box>

        {showResumeUpdateAccount && <Typography textAlign={'center'} color='var(--color-text-secondary)' mt={'auto'} mb={2}>
          It appears you’ve already generated your EDDSA key, but did not complete the final “Update Account” step in your previous session.
        </Typography>}
      </Box>
    )
  },
)

export {
  Coinbase_Smart_Wallet_Password_Intro,
  Coinbase_Smart_Wallet_Password_Set,
  Coinbase_Smart_Wallet_Password_Input,
  Coinbase_Smart_Wallet_Password_Forget_Password_Confirm,
  Coinbase_Smart_Wallet_Password_Forget_Password,
  Coinbase_Smart_Wallet_Password_Set_Processing
}
