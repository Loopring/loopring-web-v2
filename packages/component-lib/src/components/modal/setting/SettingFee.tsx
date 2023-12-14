import { WithTranslation, withTranslation } from 'react-i18next'
import {
  Button,
  CoinIcon,
  ModalCloseButton,
  ModalSettingFeeProps,
  useOpenModals,
  useSettings,
} from '../../../index'
import { Box, Link, ListItemIcon, ListItemText, Modal, Typography } from '@mui/material'
import { SwitchPanelStyled } from '../../styled'
import {
  DragListIcon,
  FeeChargeOrderDefault,
  L1L2_NAME_DEFINED,
  MapChainId,
  myLog,
} from '@loopring-web/common-resources'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd'
import React from 'react'
import { useTheme } from '@emotion/react'

export const PanelStyled = {}

export const ModalSettingFee = withTranslation('common', { withRef: true })(
  ({ t, open, onClose, style, ...rest }: ModalSettingFeeProps & WithTranslation) => {
    const theme = useTheme()
    const { feeChargeOrder, setFeeChargeOrder, defaultNetwork } = useSettings()
    const { setShowFeeSetting } = useOpenModals()
    const network = MapChainId[defaultNetwork] ?? MapChainId[1]
    const [feeChargeValue, setFeeChargeValue] = React.useState<string[]>(
      feeChargeOrder ?? FeeChargeOrderDefault,
    )
    const onDragEnd = React.useCallback((dropResult: DropResult, provider: ResponderProvided) => {
      myLog('draggableDone', dropResult, provider)
      if (dropResult.destination) {
        const { index: startIndex } = dropResult.source
        const { index: endIndex } = dropResult.destination
        setFeeChargeValue((state) => {
          const result = [].slice.call(state)
          const [removed] = result.splice(startIndex, 1)
          result.splice(endIndex, 0, removed)
          return result
        })
        // const result = [].concat(feeChargeValue);
        // const [removed] = result.splice(startIndex, 1);
        // result.splice(endIndex, 0, removed);
      }

      // result: DropResult, provided: ResponderProvided
    }, [])
    const getItemStyle = (isDragging: any, draggableStyle: any, index: number) => {
      return {
        userSelect: 'none',
        background: isDragging ? 'var(--color-box-hover)' : '',
        ...draggableStyle,
        position: draggableStyle.position === 'fixed' ? 'absolute' : '',
        //--list-coin-item = 44   +  margin = 16
        top:
          draggableStyle.position === 'fixed'
            ? `calc((var(--list-coin-item) + ${theme.unit * 2}px) * ${index})`
            : '',
        left: 0,
      }
    }
    return (
      <Modal
        open={open}
        onClose={onClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <SwitchPanelStyled width={'var(--modal-width)'}>
          <Box display={'flex'} width={'100%'} flexDirection={'column'}>
            <ModalCloseButton onClose={onClose} t={t} {...rest} />
            <Box
              flex={1}
              alignItems={'stretch'}
              display={'flex'}
              flexDirection={'column'}
              paddingX={5}
              paddingBottom={5}
            >
              <Typography component={'h4'} variant={'h3'} textAlign={'center'}>
                {t('labelSettingChargeFeeOrder')}
              </Typography>
              <Typography
                component={'h5'}
                variant={'body1'}
                color={'text.secondary'}
                textAlign={'center'}
                marginTop={2}
                marginBottom={3}
              >
                {t('labelDesSettingChargeFeeOrder', {
                  layer2: L1L2_NAME_DEFINED[network].layer2,
                  l1ChainName: L1L2_NAME_DEFINED[network].l1ChainName,
                  loopringL2: L1L2_NAME_DEFINED[network].loopringL2,
                  l2Symbol: L1L2_NAME_DEFINED[network].l2Symbol,
                  l1Symbol: L1L2_NAME_DEFINED[network].l1Symbol,
                  ethereumL1: L1L2_NAME_DEFINED[network].ethereumL1,
                })}
              </Typography>
              <Box>
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId='chargeList'>
                    {(provided) => (
                      <Box
                        display={'flex'}
                        position={'relative'}
                        marginBottom={3}
                        flexDirection={'column'}
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                      >
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
                                  index,
                                )}
                              >
                                <Typography
                                  component={'span'}
                                  variant={'h5'}
                                  display={'inline-flex'}
                                  alignItems={'center'}
                                >
                                  <ListItemIcon style={{ minWidth: '40px' }}>
                                    <CoinIcon symbol={item} size={32} />
                                  </ListItemIcon>
                                  <ListItemText>
                                    <Typography marginLeft={1} variant={'h5'}>
                                      {item}
                                    </Typography>
                                  </ListItemText>
                                </Typography>
                                <DragListIcon
                                  htmlColor={'var(--color-text-third)'}
                                  fontSize={'large'}
                                />
                              </Box>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </Box>
                    )}
                  </Droppable>
                </DragDropContext>
              </Box>

              <Button
                fullWidth
                variant={'contained'}
                size={'medium'}
                color={'primary'}
                onClick={() => {
                  // copyToClipBoard(info)
                  // setExportAccountToastOpen(true)
                  setFeeChargeOrder(feeChargeValue)
                  setShowFeeSetting({ isShow: false })
                }}
              >
                {t(`labelQueryFeeOK`)}
              </Button>
              <Typography textAlign={'center'} marginTop={1}>
                <Link
                  color={'inherit'}
                  style={{
                    textDecoration: 'underline dotted',
                    color: 'var(--color-text-secondary)',
                  }}
                  onClick={() => {
                    setFeeChargeValue(FeeChargeOrderDefault)
                  }}
                >
                  {t('labelReset')}
                </Link>
              </Typography>
            </Box>
          </Box>
        </SwitchPanelStyled>
      </Modal>
    )
  },
)
