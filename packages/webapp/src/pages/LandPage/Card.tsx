import { animated, to, useSpring } from 'react-spring';
import React from 'react';
import { WithTranslation, withTranslation } from 'react-i18next';
import { Box, styled, Typography } from '@mui/material';

export type CardProps = {
    title: string,
    icon: string,
    animationJSON: string,
    describe: string,

}
const BoxStyle = styled(animated.div)`
    svg{
      fill: ${({theme}: any) => theme.colorBase.textPrimary};
      .svg-high{
        fill: ${({theme}: any) => theme.colorBase.primary};
      }
    }
   :hover{
     svg{
       fill: ${({theme}: any) => theme.colorBase.textButton};
       .svg-high{
         fill: ${({theme}: any) => theme.colorBase.star};
       }
     }
     p, h3{
       color:${({theme}: any) => theme.colorBase.textButton};
     }
   }
` as unknown as typeof animated.div;
export const Card = withTranslation(['landPage', 'common'], {withRef: true})((
    {
        t,
        title,
        icon,
        // animationJSON,
        describe,
    }: WithTranslation & {
        title:string,
        icon: React.ReactNode,
        // animationJSON,
        describe:string,
    }) => {
    const [{
        zoom,
        scale,
        zIndex,
        boxShadow,
        border,
        background
    }, api] = useSpring(
        () => {
            return {
                // z:0,
                // position:'relative',
                scale: 1,
                zoom: 1,
                zIndex: 10,
                border: 'var(--border-card)',
                boxShadow: 'var(--box-card-shadow)',
                background: 'var(--box-card-background)',
                //(key)=>{ return key=== "zIndex"},
                default:{
                    immediate: (key)=>{
                        return  ["zIndex","boxShadow","background","border"].includes(key)
                    }
                },
                config: {
                    mass: 5, tension: 350, friction: 40,

                },

            }
        });
    return <BoxStyle
        onMouseEnter={() => api({
            scale: 1.1,
            zoom: 1,
            zIndex: 99,
            border: '0px solid #fff' ,
            boxShadow:   'inset 0px -16px 0px var(--border-card-hover), inset 0px 16px 0px var(--border-card-hover)',
            background: 'var(--box-card-background-hover)'
        })}
        className={'card'}
        onMouseLeave={() => {
            api({
                scale: 1,
                zoom: 1,
                zIndex: 10,
                border: 'var(--border-card)',
                boxShadow: 'var(--box-card-shadow)',
                background: 'var(--box-card-background)',
            })
        }}
        style={{
            transform: 'perspective(600px)',
            height: 640,
            width: 400,
            zIndex:to([zIndex],(zIndex)=>zIndex),
            background:to([background],(background)=>background),
            boxShadow:to([boxShadow],(boxShadow)=>boxShadow),
            border:to([border],(border)=>border),
            scale: to([scale, zoom],
                (s,
                 z) => s * z),
        }}>
        <Box marginTop={10}>{icon}</Box>
        <Box position={'absolute'} top={'40%'} display={'flex'} flexDirection={'column'} alignItems={'center'}>
            <Typography component={'h3'} marginTop={10}>
                <Typography whiteSpace={'pre-line'} fontWeight={500} component={'h5'}  variant={'h3'}
                >{t(title)}</Typography>
            </Typography>
            <Typography component={'p'} textAlign={'center'} marginTop={3}
                        variant={'h5'} whiteSpace={'pre-line'}  color={'var(--text-secondary)'} fontWeight={400}
                        width={306}>
                {t(describe)}
            </Typography>
        </Box>
        {/*<animated.div*/}
        {/*    style={{ transform: y.interpolate(v => `translateY(${v}%`) }}*/}
        {/*    className="glance"*/}
        {/*/>*/}
    </BoxStyle>


})
