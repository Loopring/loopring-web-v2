import { InputAdornment, OutlinedInput, OutlinedInputProps } from '@mui/material'
import { CloseIcon, SearchIcon } from '@loopring-web/common-resources'
import React from 'react'
import styled from '@emotion/styled'

const CloseIconStyled = styled(CloseIcon)`
  position: absolute;
  top: 55%;
  transform: translateY(-50%);
  right: ${({ theme }) => theme.unit}px;
  cursor: pointer;
`

export type InputSearchProps = {
  value?: string
  onChange?: (value: string) => void;
} & OutlinedInputProps

export const InputSearch = React.forwardRef(
  ({ value, onChange, ...rest }: InputSearchProps, _ref: React.ForwardedRef<any>) => {
    return (
      <OutlinedInput
        {...{ ...rest }}
        className={'search'}
        aria-label={'search'}
        placeholder={'Search'}
        value={value}
        onChange={(event: any) => {
          if (onChange) {
            onChange(event.target.value)
          }
        }}
        startAdornment={
          <InputAdornment position='start'>
            <SearchIcon color={'inherit'} />
          </InputAdornment>
        }
        endAdornment={
          <CloseIconStyled
            htmlColor={'var(--color-text-third)'}
            style={{ visibility: value ? 'visible' : 'hidden' }}
            onClick={() => {
              if (onChange) {
                onChange('' as any)
              }
            }}
          />
        }
        sx={{
          backgroundColor: 'transparent'
        }}
      />
    )
  },
)
