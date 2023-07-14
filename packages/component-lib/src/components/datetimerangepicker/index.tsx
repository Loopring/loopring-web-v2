import { ConvertToIcon } from '@loopring-web/common-resources'
import { MobileDateTimePicker } from '@mui/lab'
import { TextField, Box } from '@mui/material'
import styled from '@emotion/styled'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

const StyledDateTimeRangePicker = styled(Box)`
  background-color: var(--field-opacity);
  display: flex;
  align-items: center;
  justify-content: space-between;

  .MuiOutlinedInput-root {
    background-color: transparent !important;
    height: var(--input-height-large);
  }
`

type DateTimeRangePickerProps = {
  startValue: moment.Moment | null
  startMinDateTime?: moment.Moment
  startMaxDateTime?: moment.Moment
  onStartChange?: (m: moment.Moment | null) => void
  onStartOpen?: () => void

  endValue: moment.Moment | null
  endMinDateTime?: moment.Moment
  endMaxDateTime?: moment.Moment
  onEndChange?: (m: moment.Moment | null) => void
  onEndOpen?: () => void
  customeEndInputPlaceHolder?: string
}

export const DateTimeRangePicker = (props: DateTimeRangePickerProps) => {
  const {
    startValue,
    startMinDateTime,
    startMaxDateTime,
    onStartChange,
    onStartOpen,

    endValue,
    endMinDateTime,
    endMaxDateTime,
    onEndChange,
    onEndOpen,

    customeEndInputPlaceHolder,
  } = props
  const { t } = useTranslation()
  return (
    <StyledDateTimeRangePicker>
      <MobileDateTimePicker
        onOpen={onStartOpen}
        value={startValue}
        onChange={onStartChange ?? (() => {})}
        minDateTime={startMinDateTime}
        maxDateTime={startMaxDateTime}
        renderInput={(params) => (
          <TextField placeholder={t('labelBlindBoxStartTime')} {...params} />
        )}
      />
      <ConvertToIcon fontSize={'large'} htmlColor={'var(--color-text-third)'} />
      <MobileDateTimePicker
        onOpen={onEndOpen}
        value={endValue}
        onChange={onEndChange ?? (() => {})}
        minDateTime={endMinDateTime}
        maxDateTime={endMaxDateTime}
        renderInput={(params) => (
          <TextField
            placeholder={customeEndInputPlaceHolder ?? t('labelBlindBoxEndTime')}
            {...params}
          />
        )}
      />
    </StyledDateTimeRangePicker>
  )
}
