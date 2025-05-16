import React from 'react'
import { Box, styled } from '@mui/material'

interface BtnToggleProps {
  options: Array<{
    value: string
    label: React.ReactNode
  }>
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  optionSx?: React.CSSProperties
}

const ToggleContainer = styled(Box)(() => ({
  display: 'flex',
  borderRadius: '4px',
  overflow: 'hidden',
  backgroundColor: 'var(--color-box-secondary)',
  width: 'auto',
  '& .btnToggle-option': {
    padding: '12px 16px',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    userSelect: 'none',
    flex: 1,
    margin: '2px',
    borderRadius: '4px',
  },
  '& .btnToggle-option-active': {
    backgroundColor: 'var(--color-primary)',
    color: 'white',
  },
  '& .btnToggle-option-inactive': {
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    '&:hover': {
      backgroundColor: 'var(--color-box-hover)',
    },
  },
  '& .btnToggle-option-disabled': {
    opacity: 0.5,
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
}))

export const BtnToggle: React.FC<BtnToggleProps & Omit<React.ComponentProps<typeof Box>, 'onChange'>> = ({
  options,
  value,
  onChange,
  disabled = false,
  optionSx,
  ...rest
}) => {
  const handleClick = (optionValue: string) => {
    if (!disabled && value !== optionValue) {
      onChange(optionValue)
    }
  }

  return (
    <ToggleContainer {...rest}>
      {options.map((option) => (
        <Box
          key={option.value}
          className={`btnToggle-option ${
            disabled
              ? 'btnToggle-option-disabled'
              : value === option.value
              ? 'btnToggle-option-active'
              : 'btnToggle-option-inactive'
          }`}
          onClick={() => handleClick(option.value)}
          sx={optionSx}
        >
          {option.label}
        </Box>
      ))}
    </ToggleContainer>
  )
}
