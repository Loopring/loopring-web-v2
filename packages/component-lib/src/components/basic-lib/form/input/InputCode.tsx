import React from 'react'
import styled from '@emotion/styled'
import { Box } from '@mui/material'

const InputCodeStyle = styled(Box)`
  .code-input {
    display: flex;
    flex-direction: column;
    align-items: start;
  }

  //.code-label {
  //  margin-bottom: 16px;
  //}
  //.code-inputs {
  //  display: flex;
  //  justify-content: start;
  //  align-items: center;
  //}
  .code-inputs input {
    border: none;
    color: var(--color-text-third);
    background-color: var(--field-opacity);
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
    box-shadow: none;
    text-align: center;
    height: 60px;
    width: 40px;
    border-radius: 4px;
    margin: 0 4px;
    border: 1px solid var(--color-border);
    font-size: 38px;
  }

  .code-inputs input:focus {
    outline: none;
  }

  .code-inputs input:first-of-type {
    margin-left: 24px;
  }

  .code-inputs input:nth-of-type(3n) {
    margin-right: 24px;
  }
` as typeof Box

const InputCode = ({
  length,
  loading,
  onComplete,
}: {
  length: number
  loading: boolean
  onComplete: (code: string) => void
}) => {
  const [code, setCode] = React.useState([...Array(length)].map(() => ''))
  const inputs = React.useRef([])
  // Typescript
  // useRef<(HTMLInputElement | null)[]>([])

  const processInput = (e: React.ChangeEvent<HTMLInputElement>, slot: number) => {
    const num = e.target.value
    if (/[^0-9]/.test(num)) return
    const newCode = [...code]
    newCode[slot] = num
    setCode(newCode)
    if (slot !== length - 1) {
      // @ts-ignore
      inputs.current[slot + 1].focus()
    }
    if (newCode.every((num) => num !== '')) {
      onComplete(newCode.join(''))
    }
  }

  const onKeyUp = (e: React.KeyboardEvent<HTMLInputElement>, slot: number) => {
    if (e.keyCode === 8 && !code[slot] && slot !== 0) {
      const newCode = [...code]
      newCode[slot - 1] = ''
      setCode(newCode)
      // @ts-ignore
      inputs.current[slot - 1].focus()
    }
  }

  return (
    <InputCodeStyle
      className='code-input'
      display={'flex'}
      flexDirection={'column'}
      alignItems={'start'}
    >
      {/*<label className="code-label">{label}</label>*/}
      <Box className='code-inputs' display={'flex'} justifyContent={'start'} alignItems={'center'}>
        {code.map((num, idx) => {
          return (
            <input
              key={idx}
              type='text'
              inputMode='numeric'
              maxLength={1}
              value={num}
              autoFocus={!code[0].length && idx === 0}
              readOnly={loading}
              onChange={(e) => processInput(e, idx)}
              onKeyUp={(e) => onKeyUp(e, idx)}
              // @ts-ignore
              ref={(ref) => ref && inputs.current.push(ref)}
            />
          )
        })}
      </Box>
    </InputCodeStyle>
  )
}

export { InputCode }
