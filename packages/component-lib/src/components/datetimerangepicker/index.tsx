import { ToRightIcon } from "@loopring-web/common-resources";
import {
  MobileDateTimePicker,
  MobileDateTimePickerProps,
} from "@mui/lab";
import {
  TextField,
  Box
} from "@mui/material";
import styled from "@emotion/styled";
import {useState} from "react";
import moment from "moment";
import { TranslationProps, useTranslation, WithTranslation } from "react-i18next";

const StyledDateTimeRangePicker = styled(Box)`
  background-color: var(--field-opacity);
  display: flex;
  align-items: center;
  justify-content: space-between;
  .MuiOutlinedInput-root{
    background-color: transparent!important;
    height: var(--input-height-large);
  }
`

type DateTimeRangePickerProps = {
  startValue: moment.Moment | null,
  startMinDateTime?: moment.Moment,
  startMaxDateTime?: moment.Moment,
  onStartChange?: (m: moment.Moment | null) => void
  onStartOpen?: () => void
  
  endValue: moment.Moment | null,
  endMinDateTime?: moment.Moment,
  endMaxDateTime?: moment.Moment,
  onEndChange?: (m: moment.Moment | null) => void
  onEndOpen?: () => void
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
  } = props;
  const {t} = useTranslation()
  // const [] = useState(undefined,)
  return <StyledDateTimeRangePicker >
    <MobileDateTimePicker
      onOpen={onStartOpen}
      value={startValue}
      onChange={onStartChange ?? (() => {})}
      minDateTime={startMinDateTime}
      maxDateTime={startMaxDateTime}
      renderInput={(params) => <TextField placeholder={t("labelBlindBoxStartDate")} {...params} />}
    />
    <ToRightIcon />
    <MobileDateTimePicker
      onOpen={onEndOpen}
      value={endValue}
      onChange={onEndChange ?? (() => {})}
      minDateTime={endMinDateTime} 
      maxDateTime={endMaxDateTime} 
      renderInput={(params) => <TextField placeholder={t("labelBlindBoxEndDate")} {...params}  />}
    />
  </StyledDateTimeRangePicker>
}
