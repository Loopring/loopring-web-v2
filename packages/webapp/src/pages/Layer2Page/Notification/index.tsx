import styled from '@emotion/styled'
import {
  Box,
  Checkbox,
  Divider,
  FormControlLabel as MuiFormControlLabel,
  Grid,
  Typography,
} from '@mui/material'
import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  MaxWidthContainer,
  TablePagination,
  ToastType,
  Toast,
  LoadingStyled,
  Button,
  EmptyDefault,
} from '@loopring-web/component-lib'
import { useToast, NotificationItem, useNFTDeploy } from '@loopring-web/core'

import {
  CheckBoxIcon,
  CheckedIcon,
  DeleteIcon,
  NotificationIcon,
  ReadIcon,
  SoursURL,
  TOAST_TIME,
} from '@loopring-web/common-resources'
import { useNotification } from './hook'

const RowHeight = 116
const StyledPaper = styled(Box)`
  width: 100%;
  height: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`
const PageSizeHeight = 44
export const NotificationPanel = withTranslation(['common', 'layout'])(({ t }: WithTranslation) => {
  const container = React.useRef<HTMLDivElement>(null)
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const [{ pageSize, page, hideRead }, setPageFilter] = React.useState({
    pageSize: 0,
    page: 1,
    hideRead: true,
  })
  const {
    showLoading,
    getNotification,
    rawData,
    total,
    onReadClick,
    onReadAllClick,
    onClearAllClick,
  } = useNotification({ setToastOpen, page, pageSize })
  const handlePageChange = React.useCallback(
    async ({
      page,
      _pageSize,
      _hideRead = hideRead,
    }: {
      page: number
      _pageSize?: number
      _hideRead?: boolean
    }) => {
      setPageFilter((state) => {
        if (!_pageSize || !(Math.abs(state.pageSize - _pageSize) > 1 && _pageSize > 3)) {
          _pageSize = state.pageSize && state.pageSize > 3 ? state.pageSize : 4
        }
        _hideRead = _hideRead !== undefined ? _hideRead : state.hideRead
        return {
          page,
          hideRead: _hideRead,
          pageSize: _pageSize,
        }
      })
    },
    [pageSize, page, hideRead],
  )
  React.useEffect(() => {
    if (pageSize) {
      getNotification({
        offset: (page - 1) * pageSize,
        limit: pageSize ?? 4,
        filter: { notRead: hideRead },
      })
    }
  }, [pageSize, page, hideRead])

  React.useEffect(() => {
    if (container?.current?.offsetHeight && pageSize == 0) {
      let pageSize = Math.floor((container.current.offsetHeight - 10) / RowHeight)
      handlePageChange({ page, _pageSize: pageSize })
    }
  }, [container?.current?.offsetHeight])

  return (
    <Box flex={1} display={'flex'} flexDirection={'column'}>
      <MaxWidthContainer
        sx={{ flexDirection: 'row' }}
        background={'var(--color-global-bg)'}
        display={'flex'}
        justifyContent={'space-between'}
        paddingY={2}
      >
        <Typography component={'h3'} variant={'h5'} display={'inline-flex'} alignItems={'center'}>
          <NotificationIcon color={'inherit'} sx={{ marginRight: 1 }} /> {t('labelNoticeTitle')}
        </Typography>
        <Box>
          <MuiFormControlLabel
            control={
              <Checkbox
                checked={hideRead}
                onChange={(_event: any, state: boolean) => {
                  handlePageChange({ page, _hideRead: state })
                }}
                checkedIcon={<CheckedIcon />}
                icon={<CheckBoxIcon />}
                color='default'
              />
            }
            label={t('labelHideRead')}
          />
          <Button
            startIcon={<ReadIcon color={'inherit'} fontSize={'small'} />}
            variant={'text'}
            size={'small'}
            sx={{ color: 'var(--color-text-primary)' }}
            onClick={async () => {
              await onReadAllClick()
              handlePageChange({ page })
            }}
          >
            {t('labelNotificationReadAll')}
          </Button>
          <Button
            startIcon={<DeleteIcon color={'inherit'} fontSize={'small'} />}
            variant={'text'}
            size={'small'}
            sx={{ color: 'var(--color-text-primary)' }}
            onClick={async () => {
              await onClearAllClick()
              handlePageChange({ page })
            }}
          >
            {t('labelNotificationClear')}
          </Button>
        </Box>
      </MaxWidthContainer>
      <Divider />
      <MaxWidthContainer
        background={'var(--color-pop-bg)'}
        containerProps={{ flex: 1 }}
        display={'flex'}
        justifyContent={'space-between'}
        paddingY={2}
      >
        <StyledPaper
          className={'MuiPaper-elevation2'}
          margin={0}
          marginBottom={2}
          paddingX={2}
          paddingY={2}
          flex={1}
          height={'100%'}
        >
          <Box display={'flex'} flex={1} ref={container} height={'100%'}>
            {!!rawData.length ? (
              <Grid
                container
                paddingBottom={2}
                display={'flex'}
                flex={1}
                alignContent={'flex-start'}
              >
                {rawData.map((ele, index) => {
                  return (
                    <Grid
                      item
                      xs={12}
                      key={ele.id}
                      maxHeight={RowHeight}
                      sx={{ overflow: 'scroll' }}
                    >
                      <NotificationItem {...ele} index={index} onReadClick={onReadClick} />
                      {index !== rawData?.length - 1 && <Divider />}
                    </Grid>
                  )
                })}
              </Grid>
            ) : (
              <EmptyDefault
                style={{ flex: 1 }}
                height={'100%'}
                message={() => (
                  <Box flex={1} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                    {t('labelNoContent')}
                  </Box>
                )}
              />
            )}
            {showLoading && (
              <LoadingStyled color={'inherit'}>
                <img
                  className='loading-gif'
                  alt={'loading'}
                  width='36'
                  src={`${SoursURL}images/loading-line.gif`}
                />
              </LoadingStyled>
            )}
          </Box>
          <Box height={PageSizeHeight}>
            {total && total > pageSize ? (
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={(page) => {
                  handlePageChange({ page })
                }}
              />
            ) : (
              <></>
            )}
          </Box>
        </StyledPaper>
      </MaxWidthContainer>
      <Toast
        alertText={toastOpen?.content ?? ''}
        severity={toastOpen?.type ?? ToastType.success}
        open={toastOpen?.open ?? false}
        autoHideDuration={TOAST_TIME}
        onClose={closeToast}
      />
    </Box>
  )
})
