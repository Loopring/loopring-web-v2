import { Box, Typography } from '@mui/material'
import { Button, ModalCloseButton } from '@loopring-web/component-lib'
import styled from '@emotion/styled'
import React from 'react'
import { useTranslation } from 'react-i18next'

const StyledBox = styled(Box)`
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: var(--color-pop-bg);
  border-top: 1px solid var(--color-border);
  //text-align: center;
  .close-button {
    right: ${({ theme }) => (theme.unit * 5) / 2}px;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 0;
  }
  .full-btn-close {
  }
` as typeof Box

export interface PopperProps {
  isShow: boolean
  title?: string
  content: string
  btnTxt: string
  clickToConfirm?: () => void
}

export const BottomRule = ({ isShow, title, content, btnTxt, clickToConfirm }: PopperProps) => {
  const [_isShow, setIsShow] = React.useState(isShow)
  const trans = useTranslation()
  return _isShow ? (
    <StyledBox
      height={60}
      width={'100%'}
      flex={1}
      display={'flex'}
      alignItems={'center'}
      justifyContent={'center'}
      flexDirection={'row'}
      position={'fixed'}
    >
      {title ? <Typography className={'title'}>{title}</Typography> : <></>}
      <Typography className={'content'} color={'textSecondary'} variant={'body1'} paddingX={3}>
        {content}
      </Typography>
      <Button
        variant={'contained'}
        size={'small'}
        onClick={() => {
          if (clickToConfirm) {
            clickToConfirm()
            setIsShow(false)
          }
        }}
      >
        {btnTxt}
      </Button>
      <ModalCloseButton onClose={() => setIsShow(false)} {...{ ...trans, tReady: true }} />
    </StyledBox>
  ) : (
    <></>
  )
}
