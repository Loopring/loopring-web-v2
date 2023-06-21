import React from 'react'
import { Box, Grid, ListItemText, MenuItem } from '@mui/material'
import styled from '@emotion/styled'
import { Button, Popover, PopoverType, PopoverWrapProps } from '../../../basic-lib'
import { MoreIcon } from '@loopring-web/common-resources'
import { useSettings } from '../../../../stores'
import { RawDataDefiSideStakingItem } from '../Interface'
import { useTranslation } from 'react-i18next'

const GridStyled = styled(Grid)`
  .MuiGrid-item {
    padding: ${({ theme }) => theme.unit / 4}px 0 0;
  }
`
export type ActionProps<R> = {
  item: R
  redeemItemClick: (item: R) => void
  onDetailClick: (item: R) => void
}
const ActionPopContent = React.memo(
  <R extends RawDataDefiSideStakingItem>({
    redeemItemClick,
    onDetailClick,
    item,
  }: ActionProps<R>) => {
    const { t } = useTranslation(['tables', 'common'])

    const { isMobile } = useSettings()
    const tradeList = [
      <MenuItem key={'token-Receive'} onClick={() => onDetailClick(item)}>
        <ListItemText>{t('labelDefiStakingDetail', { ns: 'tables' })}</ListItemText>
      </MenuItem>,
      <MenuItem key={'token-Send'} onClick={() => redeemItemClick(item)}>
        <ListItemText>{t('labelDefiStakingRedeem', { ns: 'tables' })}</ListItemText>
      </MenuItem>,
    ]

    return (
      <Box borderRadius={'inherit'} minWidth={110}>
        {isMobile &&
          tradeList.map((item, index) => <React.Fragment key={index}>{item}</React.Fragment>)}
      </Box>
    )
  },
) as <R extends RawDataDefiSideStakingItem>(props: ActionProps<R>) => JSX.Element

const ActionMemo = React.memo(<R extends RawDataDefiSideStakingItem>(props: ActionProps<R>) => {
  const { isMobile } = useSettings()
  const { t } = useTranslation(['tables', 'common'])

  const { redeemItemClick, onDetailClick, item } = props
  const popoverProps: PopoverWrapProps = {
    type: PopoverType.click,
    popupId: 'testPopup',
    className: 'arrow-none',
    children: <MoreIcon cursor={'pointer'} />,
    popoverContent: <ActionPopContent {...props} />,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'right',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'right',
    },
  } as PopoverWrapProps

  return (
    <GridStyled
      container
      spacing={1}
      justifyContent={'space-between'}
      alignItems={'center'}
      flexWrap={'nowrap'}
      padding={0}
      margin={0}
      height={'100%'}
    >
      {isMobile ? (
        <>
          <Grid item marginTop={1}>
            <Popover {...{ ...popoverProps }} />
          </Grid>
        </>
      ) : (
        <>
          <Button
            variant={'text'}
            size={'small'}
            color={'primary'}
            onClick={() => onDetailClick(item)}
          >
            {t('labelDefiStakingDetail', { ns: 'tables' })}
          </Button>
          <Button
            variant={'text'}
            size={'small'}
            color={'primary'}
            onClick={() => redeemItemClick(item)}
          >
            {t('labelDefiStakingRedeem', { ns: 'tables' })}
          </Button>
        </>
      )}
    </GridStyled>
  )
}) as <R extends RawDataDefiSideStakingItem>(props: ActionProps<R>) => JSX.Element
export default ActionMemo
