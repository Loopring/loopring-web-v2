/* Rectangle 340 */
import styled from '@emotion/styled'
import { BtnPercentageProps } from './Interface'
import { Box, Slider } from '@mui/material'
import { WithTranslation, withTranslation } from 'react-i18next'
import React from 'react'
import { Mark } from '@mui/base/SliderUnstyled/SliderUnstyledProps'
import { myLog } from '@loopring-web/common-resources'

const StyledSlider = styled(Slider)`
  && {
    border: 0;

    & .MuiSlider-mark {
      width: 24px;
      height: 24px;
      line-height: initial;
      box-sizing: border-box;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      background: var(--opacity);
      border: 0;
      transform: translate(-50%, -50%);
      z-index: 25;

      :after {
        content: '';
        width: 8px;
        height: 8px;
        background: var(--color-box);
        ${({ theme }) =>
          theme.border.defaultFrame({
            d_W: 1,
            d_R: 2,
            c_key: 'var(--color-secondary)',
          })};
      }
    }

    & .MuiSlider-markLabel {
      line-height: initial;
    }

    & .MuiSlider-rail {
      width: 100%;
      height: 4px;
      border-radius: 4px;
      background-color: var(--color-divide);
      z-index: 10;
      transform: translateY(-50%);
    }

    & .MuiSlider-track {
      width: 100%;
      height: 4px;
      border-radius: 4px;
      background-color: var(--color-secondary);
      z-index: 15;
      transform: translateY(-50%);
    }

    & .MuiSlider-thumb {
      z-index: 30;
      transform: translate(-50%, -50%);
      width: 18px;
      height: 18px;
      color: var(--color-button-pot);
      margin-top: 0;
      margin-left: 0;
      ${({ theme }) =>
        theme.border.defaultFrame({
          d_W: 2,
          d_R: 12,
          c_key: 'var(--color-secondary)',
        })};
      box-shadow: initial;

      input {
        cursor: pointer;
      }

      .MuiSlider-valueLabel {
        background: var(--opacity);
        padding: 0;
        top: -4px;
      }
    }
  }
` as typeof Slider

export const BtnPercentage = withTranslation('common')(
  ({
    selected = -1,
    handleChanged,
    anchors,
    valueLabelDisplay = 'off',
    valuetext,
    step = 1,
    t,
    tReady,
    ...rest
  }: BtnPercentageProps & WithTranslation) => {
    const [value, setValue] = React.useState<number>(selected)

    React.useEffect(() => {
      myLog('selected', selected)
      if (selected >= 0 && selected <= 100) {
        setValue(Math.floor(selected))
      } else {
        setValue(0)
      }
    }, [selected])
    const _anchors: Mark[] =
      anchors && anchors.length
        ? anchors
        : [
            {
              value: 0,
              label: '0',
            },
            {
              value: 25,
              label: '',
            },
            {
              value: 50,
              label: '',
            },
            {
              value: 75,
              label: '',
            },
            {
              value: 100,
              label: t('labelMax:') + '100%',
            },
          ]
    const _handleChanged = (_event: Event, value: number | number[], _activeThumb: number) => {
      setValue(value as number)
      handleChanged(value)
    }
    const _valuetext = (value: number): string | number => {
      if (valuetext) {
        return valuetext(value)
      } else {
        return value
      }
    }
    // function valuetext(value: number) {
    //     return `${value}°C`;
    // }
    return (
      <Box width={'100%'} display={'flex'}>
        <StyledSlider
          {...rest}
          aria-label='Always visible'
          value={value}
          getAriaValueText={_valuetext as any}
          valueLabelDisplay={valueLabelDisplay}
          onChange={(_event, value, _activeThumb) => {
            _handleChanged(_event, value, _activeThumb)
          }}
          step={step}
          marks={_anchors}
        />
      </Box>
    )
  },
)
