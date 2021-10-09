import { WithTranslation, withTranslation } from 'react-i18next';
import { Button, CoinIcon, ModalCloseButton, ModalSettingFeeProps, useOpenModals, useSettings } from '../../../index';
import { Box, Link, ListItemIcon, ListItemText, Modal, Typography } from '@mui/material';
import { SwitchPanelStyled } from '../../styled';
import { DragListIcon, FeeChargeOrderDefault } from '@loopring-web/common-resources';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import React from 'react';
import { useTheme } from '@emotion/react';

export const PanelStyled = {}


export const ModalSettingFee = withTranslation('common', {withRef: true})((
    {
        t,
        open,
        onClose,
        style,
        ...rest
    }: ModalSettingFeeProps & WithTranslation) => {
    const theme = useTheme();
    // const {w, h} = style ? style : {w: undefined, h: undefined};
    const {feeChargeOrder, setFeeChargeOrder} = useSettings();
    const {setShowFeeSetting} = useOpenModals();

    const [feeChargeValue, setFeeChargeValue] = React.useState<string[]>(feeChargeOrder ?? FeeChargeOrderDefault);
    const onDragEnd = React.useCallback(() => {

    }, [])
    const getItemStyle = (isDragging: any, draggableStyle: any) => {
        // debugger
        // myLog(draggableStyle.top)
        return {
            userSelect: 'none',
            background: isDragging ? 'var(--color-box-hover)' : '',
            ...draggableStyle,
            // margin:0,
            // top: theme.unit,
            // top: draggableStyle.top?(draggableStyle.top - theme.unit*5):'',
            left: theme.unit * 5,
        }
    };
    return <Modal
        open={open}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
    >
        <SwitchPanelStyled width={'var(--modal-width)'}>
            <Box display={'flex'} width={"100%"} flexDirection={'column'}>
                <ModalCloseButton onClose={onClose} t={t}  {...rest}/>
                <Box flex={1} alignItems={'stretch'} display={'flex'} flexDirection={'column'} paddingX={5}
                     paddingBottom={5}>
                    <Typography component={'h4'} variant={'h3'} textAlign={'center'}>
                        {t('labelSettingChargeFeeOrder')}
                    </Typography>
                    <Typography component={'h5'} variant={'body1'} color={'text.secondary'} textAlign={'center'}
                                marginTop={2} marginBottom={3}>
                        {t('desSettingChargeFeeOrder')}
                    </Typography>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Droppable droppableId="chargeList">
                            {(provided) => (
                                <Box display={'flex'}
                                     position={'relative'}
                                     marginBottom={3}
                                     flexDirection={'column'}  {...provided.droppableProps}
                                     ref={provided.innerRef}>
                                    {feeChargeValue.map((item, index) => (

                                        <Draggable key={item} draggableId={item} index={index}>
                                            {(draggableProvided, draggableSnapshot) => (
                                                <Box
                                                    marginY={1}
                                                    paddingY={1}
                                                    height={'var(--list-coin-item)'}
                                                    display={'inline-flex'}
                                                    alignItems={'center'}
                                                    justifyContent={'space-between'}
                                                    ref={draggableProvided.innerRef}
                                                    {...draggableProvided.draggableProps}
                                                    {...draggableProvided.dragHandleProps}
                                                    style={getItemStyle(
                                                        draggableSnapshot.isDragging,
                                                        draggableProvided.draggableProps.style,
                                                    )}
                                                >
                                                    <Typography component={'span'} variant={'h5'}
                                                                display={'inline-flex'} alignItems={'center'}>
                                                        <ListItemIcon style={{minWidth: '40px'}}>
                                                            <CoinIcon symbol={item} size={32}/>
                                                        </ListItemIcon>
                                                        <ListItemText><Typography marginLeft={1}
                                                                                  variant={'h5'}>{item}</Typography>
                                                        </ListItemText>
                                                    </Typography>
                                                    <DragListIcon htmlColor={'var(--color-text-third)'}
                                                                  fontSize={'large'}/>
                                                </Box>
                                            )}
                                        </Draggable>
                                    ))}
                                </Box>
                            )}
                            {/*<Droppable droppableId="droppable">*/}
                            {/*    {(droppableProvided) => (*/}
                            {/*        <Box*/}
                            {/*            ref={droppableProvided.innerRef}*/}
                            {/*            // style={{*/}
                            {/*            //     width: 250,*/}
                            {/*            //     background: 'lightblue',*/}
                            {/*            //*/}
                            {/*            //     // ...withAssortedSpacing(),*/}
                            {/*            //     // no margin collapsing*/}
                            {/*            //     marginTop: 0,*/}
                            {/*            // }}*/}
                            {/*        >*/}
                            {/*          */}
                            {/*            {droppableProvided.placeholder}*/}
                            {/*        </Box>*/}
                            {/*    )}*/}
                            {/*</Droppable>*/}
                        </Droppable>
                    </DragDropContext>
                    <Button fullWidth variant={'contained'} size={'medium'} color={'primary'} onClick={() => {
                        // copyToClipBoard(info)
                        // setExportAccountToastOpen(true)
                        setFeeChargeOrder(feeChargeValue)
                        setShowFeeSetting({isShow: false})
                    }}
                    >{t(`labelQueryFeeOK`)}
                    </Button>
                    <Typography textAlign={'center'} marginTop={1}>
                        <Link color={'inherit'} style={{
                            textDecoration: 'underline dotted',
                            color: 'var(--color-text-secondary)'
                        }} onClick={() => {
                            setFeeChargeValue(FeeChargeOrderDefault);
                        }}>{t('labelReset')}</Link>
                        {/*<Button fullWidth variant={'text'} size={'medium'} color={'primary'} onClick={() => {*/}
                        {/*    // copyToClipBoard(info)*/}
                        {/*    // setExportAccountToastOpen(true)*/}
                        {/*    setFeeChargeOrder(feeChargeValue)*/}
                        {/*    setShowFeeSetting({isShow:false})*/}
                        {/*}}*/}
                        {/*>{t(`labelExportAccountCopy`)}*/}
                        {/*</Button>*/}
                    </Typography>

                </Box>
                {/*{onBack ? <ModalBackButton onBack={onBack}  {...rest}/> :<></>}*/}
            </Box>
        </SwitchPanelStyled>
    </Modal>;
})
