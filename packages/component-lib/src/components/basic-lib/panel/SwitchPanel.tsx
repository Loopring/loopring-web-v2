import { WithTranslation } from "react-i18next";
import SwipeableViews, { SwipeableViewsProps } from 'react-swipeable-views';

import React, { RefAttributes } from 'react';
import { useTheme } from '@emotion/react';
import { Grid, Toolbar } from '@material-ui/core';
import styled from '@emotion/styled';


export type PanelContent<T extends string> = {
    key: T,
    element: () => React.ElementType<any> | JSX.Element,
    toolBarItem: () => React.ElementType<any> | JSX.Element,
}
export type SwitchPanelProps<T extends string> = {
    // swipedBy: T,
    index: number,
    // defaultIndex: number,
    panelList: Array<PanelContent<T>>,
    // onChangeIndex?: (index: number,data:any) => void,
    // onTransitionEnd?: () => void,
    height?: number | string;
    // width?: number | string;

}
//${({theme}) => theme.border.defaultFrame({c_key: 'blur', d_R: 1})};
export const WrapStyled = styled(SwipeableViews)<SwipeableViewsProps>`
  border-radius: ${({theme}) => theme.unit}px;
  ${({height, width, theme}) => `       
    // background-color: ${theme.colorBase.background().default};
    background: ${theme.colorBase.background().swap}; 
    width: ${typeof width === 'string' ? width : typeof width === 'number' ? width + 'px' : `var(--swap-box-width)`}; 
    .container{
       padding:0 0 ${theme.unit * 3 + 'px'};
       min-height: var(--swap-box-height);
       height:100%;
       // height: ${typeof height === 'string' ? height : typeof height === 'number' ? height + 'px' : `var(--swap-box-height)`};
       // width: 100%;
    }
     .MuiToolbar-root {
        align-content: stretch;
        justify-content: flex-end;
        padding:0 ${theme.unit / 2 * 5 + 'px'} ${theme.unit / 2 + 'px'};    
        box-sizing: border-box;
        height: var(--toolbar-row-height);
        min-height:  var(--toolbar-row-height);
        max-height:  var(--toolbar-row-height);
        .MuiIconButton-root {
            height: var(--btn-icon-size);
            width: var(--btn-icon-size);
            min-width: var(--btn-icon-size);
            margin: 0;
            display: flex;
            padding: 0;
            justify-content: center;
            justify-items: center;
            align-items: center;
            font-size: ${theme.fontDefault.h4}; 
        }
        // .go-back{
        //   font-size: ${theme.fontDefault.h4}; 
        //   margin-right: ${theme.unit + 'px'}; 
        //   transform: rotate(90deg);
        // }
    }
     `};


` as React.ElementType<SwipeableViewsProps>;

function _SwitchPanel<T extends string>({
                                            index,
                                            panelList,
                                        }: SwitchPanelProps<T> & WithTranslation, _ref: React.ForwardedRef<any>) {
    const theme = useTheme();
    return <WrapStyled axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={index}>
        {panelList.map((panel: PanelContent<T>) => {
            return <Grid container key={panel.key} className={'container'} direction={'column'}
                         justifyContent={"start"} flexWrap={'nowrap'}>
                <Toolbar variant={'dense'}>
                    {panel.toolBarItem()}
                </Toolbar>
                <Grid item flex={1}>{panel.element()}</Grid>
            </Grid>
        })}
    </WrapStyled>
}

export const SwitchPanel = React.memo(React.forwardRef(_SwitchPanel)) as <T extends string>(props: SwitchPanelProps<T> & WithTranslation & RefAttributes<any>) => JSX.Element;
