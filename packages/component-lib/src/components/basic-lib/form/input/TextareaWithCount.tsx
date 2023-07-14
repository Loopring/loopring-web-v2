import { TextareaAutosizeStyled } from './style'
import React from 'react'
import { TextareaAutosizeProps } from '@mui/base/TextareaAutosize/TextareaAutosize'
import { Box, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'

export const TextareaWithCount = ({
  // totalCount,
  value,
  handleError,
  ...rest
}: TextareaAutosizeProps & {
  label?: string
  // totalCount: number;
  handleError?: (
    value: string,
    count: number,
  ) =>
    | {
        error: boolean
        message?: string | JSX.Element
      }
    | undefined
}) => {
  const [countObj, setCountObj] = React.useState({
    number: 0,
    count: rest.maxLength ?? 25,
  })
  const { t } = useTranslation(['error', 'common'])
  const [error, setError] = React.useState<{
    error: boolean
    message?: string | JSX.Element
  }>({
    error: false,
    message: '',
  })
  React.useEffect(() => {
    if (value === undefined && error.error) {
      setError({ error: false })
    }
  }, [value])
  const _handleError = React.useCallback(
    (value: any) => {
      if (handleError) {
        const error = handleError(value, countObj.count)
        if (error) {
          setError(error)
        } else {
          setError({ error: false })
        }
      } else {
        if (value.length > countObj.count) {
          setError({
            error: true,
            message: t('errorLengthLimit', {}),
          })
        } else {
          setError({ error: false })
        }
      }
    },
    [countObj],
  )

  return (
    <Box display={'flex'} flexDirection={'column'} justifyContent={'stretch'}>
      <TextareaAutosizeStyled
        {...{ ...rest }}
        className={`${rest.className}  ${error.error ? 'error' : ''}`}
        value={value}
        aria-label={rest.label}
        maxRows={rest.maxRows ?? 5}
        minRows={rest.minRows ?? 5}
        disabled={rest.disabled}
        style={{
          overflowX: 'hidden',
          resize: 'vertical',
          ...rest.style,
        }}
        maxLength={rest.maxLength}
        onChange={(event, ..._rest) => {
          setCountObj((state) => ({
            number: event.target.value?.length ?? 0,
            count: state.count,
          }))
          _handleError(event.target.value)
          rest.onChange && rest.onChange(event, ..._rest)
        }}
        draggable={true}
      />
      <Typography
        color={error.error ? 'var(--color-error)' : 'var(--color-text-third)'}
        alignSelf={'flex-end'}
        alignItems={'flex-end'}
        display={'inline-flex'}
        // marginTop={1 / 2}
      >
        {`${countObj.number}/${countObj.count}`}
        {/*{this.state.count}*/}
        {/*{countLimit > 0 && `/${countLimit}`}*/}
      </Typography>
    </Box>
  )
}
