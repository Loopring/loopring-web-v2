/* Rectangle 340 */
import styled from "@emotion/styled";
import { BtnPercentageProps } from "./Interface";
import { Slider } from "@mui/material";
import { Box } from "@mui/material";
import { WithTranslation, withTranslation } from "react-i18next";
import React from "react";

//
// export const BtnPercentage = ({selected = -1, handleChanged, anchors}: BtnPercentageProps) => {
//     const _anchors = anchors && anchors.length ? anchors : [0, 20, 40, 60, 80, 100];
//     const _handleChanged = React.useCallback((item) => {
//         handleChanged(item)
//     }, [handleChanged])
//     return <Box width={'100%'} display={'flex'} boxSizing={'content-box'} paddingY={1}>
//         <Box flex={1} height={'100%'} margin={1}>
//             <Box component={'div'} zIndex={'88'} display={'flex'} alignItems={'center'} justifyContent={'stretch'}
//                  position={'relative'}>
//                 <Track/>
//                 <Thumb width={`${selected}%`}/>
//                 <Box component={'div'} zIndex={'121'} flex={1} display={'flex'} alignItems={'center'} width={'100%'}
//                      height={'100%'} position={'relative'}>
//                     {_anchors.map((item: number, index) => {
//                         if (selected === item) {
//                             return <React.Fragment key={index}>
//                                 <PointOnStyled left={`calc(${item}% - 7px)`} position={'absolute'}/>
//                                 <Typography component={'span'} style={{fontSize: '1.6rem'}} position={'absolute'}
//                                             top={16} left={`calc(${selected}% - 12px)`}>{selected}%</Typography>
//                             </React.Fragment>
//                         }
//                         return <PointStyled key={index} left={`calc(${item}% - 12px)`} position={'absolute'}
//                                             onClick={() => {
//                                                 _handleChanged(item)
//                                             }}/>
//                     })
//                     }
//                 </Box>
//             </Box>
//             <Box component={'div'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}
//                  position={'relative'} marginTop={1.2}>
//                 <Typography component={'span'} variant={'body2'} color={'textSecondary'}
//                             marginLeft={-1}>{selected !== 0 ? '0%' : ' '}</Typography>
//                 <Typography component={'span'} variant={'body2'} color={'textSecondary'}
//                             marginRight={-1}>{selected !== 100 ? '100%' : ' '}</Typography>
//             </Box>
//         </Box>
//     </Box>
//
// }
//
// export const BtnPercentageDraggable = ({selected = -1,maxValue, handleChanged, anchors}: BtnPercentageDraggableProps) => {
//     const [_selected,setSelected] = React.useState(selected)
//     const _anchors = anchors && anchors.length ? anchors : [0, 20, 40, 60, 80, 100];
//     const _handleChanged = React.useCallback((event,point:'point'|'thumb'|'track',item?) => {
//         if(point === 'point'){
//             const parentElement = event.currentTarget.parentElement.parentElement;
//             const {offsetLeft,offsetWidth} = parentElement;
//             // const value = Math.round((offsetLeft - 7)/offsetWidth*100);
//             console.log('event.clientX,offsetWidth,offsetLeft,value',event.clientX,offsetWidth,offsetLeft)
//             console.log(event.clientX-offsetLeft)
//             console.log((event.clientX-offsetLeft)/offsetWidth*100)
//             handleChanged(item)
//             setSelected(item)
//         }else{
//             console.log(event,'point','event.currentTarget.parentElement')
//             const parentElement = event.currentTarget.parentElement;
//             const {offsetLeft,offsetWidth} = parentElement;
//             const value = Math.round((event.clientX-offsetLeft)/offsetWidth*100);
//             console.log('event.clientX,offsetWidth,offsetLeft,value',event.clientX,offsetWidth,offsetLeft)
//             console.log((event.clientX-offsetLeft)/offsetWidth*100)
//
//             handleChanged(value)
//             setSelected(value)
//             // event.currentTarget.parentElement.offsetLeft
//             // event.currentTarget.parentElement.offsetWidth
//
//         }
//
//     }, [handleChanged])
//     return <Box width={'100%'} display={'flex'} boxSizing={'content-box'} paddingY={1} height={56}>
//         <Box flex={1} height={'100%'} margin={1}>
//             <Box component={'div'} zIndex={'88'} display={'flex'} alignItems={'center'} justifyContent={'stretch'}
//                  position={'relative'}>
//                     {/*<PointOnStyled left={`calc(${item}% - 7px)`} position={'absolute'}/>*/}
//                     {/*<Typography component={'span'} style={{fontSize: '1.6rem'}} position={'absolute'}*/}
//                     {/*            bottom={16} left={`calc(${selected}% - 12px)`}>{selected}%</Typography>*/}
//                 { _selected !== -1?<>
//                     <PointOnStyled left={`calc(${_selected}% - 7px)`} position={'absolute'} zIndex={'134'}/>
//                     <Typography component={'span'} style={{fontSize: '1.6rem'}} position={'absolute'}
//                                 bottom={16} left={`calc(${_selected}% - 12px)`}>{_selected}%</Typography>
//                 </>:<></>
//
//                 }
//
//                 <Box component={'div'} zIndex={'121'} flex={1} display={'flex'} alignItems={'center'} width={'100%'}
//                      height={'100%'} position={'relative'}>
//                     {_anchors.map((item: number, index:number) => {
//                         if (_selected === item) {
//                             return <></>
//                         }
//                         return <PointStyled key={index} left={`calc(${item}% - 12px)`} position={'absolute'}
//                                             onClick={(event) => {
//                                                 _handleChanged(event,'point',item)
//                                             }}/>
//                     })
//                     }
//                 </Box>
//                 <Track onClick={(event) => {_handleChanged(event,'track')}}/>
//                 <Thumb width={`${_selected}%`} onClick={(event) => {_handleChanged(event,'thumb')}} />
//
//             </Box>
//             <Box component={'div'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}
//                  position={'relative'} marginTop={1.2}>
//                 <Typography component={'span'} variant={'body2'} color={'textSecondary'}
//                             marginLeft={-.5}>{'0'}</Typography>
//                 <Typography component={'span'} variant={'body2'} color={'textSecondary'}
//                             marginRight={-.5}>{ maxValue }</Typography>
//             </Box>
//         </Box>
//     </Box>
//
// }

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
        content: "";
        width: 8px;
        height: 8px;
        background: var(--color-box);
        ${({ theme }) =>
          theme.border.defaultFrame({
            d_W: 1,
            d_R: 2,
            c_key: "var(--color-secondary)",
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
          c_key: "var(--color-secondary)",
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
` as typeof Slider;

export const BtnPercentage = withTranslation("common")(
  ({
    selected = -1,
    handleChanged,
    anchors,
    valueLabelDisplay = "off",
    valuetext,
    step = 1,
    t,
    tReady,
    ...rest
  }: BtnPercentageProps & WithTranslation) => {
    const [value, setValue] = React.useState<number>(selected);

    React.useEffect(() => {
      if (selected >= 0 && selected <= 100) {
        setValue(Math.floor(selected));
      } else {
        setValue(0);
      }
    }, [selected]);

    const _anchors =
      anchors && anchors.length
        ? anchors
        : [
            {
              value: 0,
              label: "0",
            },
            {
              value: 25,
              label: "",
            },
            {
              value: 50,
              label: "",
            },
            {
              value: 75,
              label: "",
            },
            {
              value: 100,
              label: t("labelMax:") + "100%",
            },
          ];
    const _handleChanged = (
      _event: Event,
      value: number | number[],
      _activeThumb: number
    ) => {
      setValue(value as number);
      handleChanged(value);
    };
    const _valuetext = (value: number): string | number => {
      if (valuetext) {
        return valuetext(value);
      } else {
        return value;
      }
    };
    // function valuetext(value: number) {
    //     return `${value}°C`;
    // }
    return (
      <Box width={"100%"} display={"flex"}>
        <StyledSlider
          {...rest}
          aria-label="Always visible"
          value={value}
          getAriaValueText={_valuetext as any}
          valueLabelDisplay={valueLabelDisplay}
          onChange={(_event, value, _activeThumb) => {
            _handleChanged(_event, value, _activeThumb);
          }}
          step={step}
          marks={_anchors}
        />
      </Box>
    );
  }
);
