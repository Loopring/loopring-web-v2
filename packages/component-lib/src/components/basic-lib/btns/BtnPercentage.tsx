/* Rectangle 340 */
import styled from '@emotion/styled';
import { Box, Typography } from '@material-ui/core/';
import React from 'react';
import { BtnPercentageProps } from './Interface';

const PointOnStyled = styled(Box)`
  width: 14px;
  height: 14px;
  box-sizing: border-box;
  cursor: pointer;
  background: ${({theme}) => theme.colorBase.textSecondary};
  ${({theme}) => theme.border.defaultFrame({d_W: 3, d_R: 12, c_key: theme.colorBase.textPrimary})};

` as typeof Box
const PointStyled = styled(Box)`
  width: 24px;
  height: 24px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;

  :after {
    content: '';
    width: 10px;
    height: 10px;
    background: ${({theme}) => theme.colorBase.textSecondary};
    ${({theme}) => theme.border.defaultFrame({d_W: 1, d_R: 2, c_key: 'var(--opacity)'})};
  }
` as typeof Box
const Track = styled.div`
  width: 100%;
  height: 4px;
  border-radius: 4px;
  position: absolute;
  background-color: var(--color-divide);
  z-index: 99;
  left: 1px;
  right: 1px;
  transform: translateY(-50%);
  top: 50%;
  //display: flex;
  //align-items: center;
`
const Thumb = styled(Box)`
  height: 4px;
  border-radius: 4px;
  position: absolute;
  background-color: ${({theme}) => theme.colorBase.textSecondary};
  z-index: 102;
  left: 1px;
  transform: translateY(-50%);
  top: 50%;
  //display: flex;
  //align-items: center;
` as typeof Box


export const BtnPercentage = ({selected = -1, handleChanged, anchors}: BtnPercentageProps) => {
    const _anchors = anchors && anchors.length ? anchors : [0, 20, 40, 60, 80, 100];
    const _handleChanged = React.useCallback((item) => {
        handleChanged(item)
    }, [handleChanged])
    return <Box width={'100%'} display={'flex'} boxSizing={'content-box'} paddingY={1}>
        <Box flex={1} height={'100%'} margin={1}>
            <Box component={'div'} zIndex={'88'} display={'flex'} alignItems={'center'} justifyContent={'stretch'}
                 position={'relative'}>
                <Track/>
                <Thumb width={`${selected}%`}/>
                <Box component={'div'} zIndex={'121'} flex={1} display={'flex'} alignItems={'center'} width={'100%'}
                     height={'100%'} position={'relative'}>
                    {_anchors.map((item: number, index) => {
                        if (selected === item) {
                            return <React.Fragment key={index}>
                                <PointOnStyled left={`calc(${item}% - 7px)`} position={'absolute'}/>
                                <Typography component={'span'} style={{fontSize: '1.6rem'}} position={'absolute'}
                                            top={16} left={`calc(${selected}% - 12px)`}>{selected}%</Typography>
                            </React.Fragment>
                        }
                        return <PointStyled key={index} left={`calc(${item}% - 12px)`} position={'absolute'}
                                            onClick={() => {
                                                _handleChanged(item)
                                            }}/>
                    })
                    }
                </Box>
            </Box>
            <Box component={'div'} display={'flex'} alignItems={'center'} justifyContent={'space-between'}
                 position={'relative'} marginTop={1.2}>
                <Typography component={'span'} variant={'body2'} color={'textSecondary'}
                            marginLeft={-1}>{selected !== 0 ? '0%' : ' '}</Typography>
                <Typography component={'span'} variant={'body2'} color={'textSecondary'}
                            marginRight={-1}>{selected !== 100 ? '100%' : ' '}</Typography>
            </Box>
        </Box>
    </Box>

}