import styled from '@emotion/styled'
import { Box, Divider, Grid, Typography } from '@mui/material'
import React from 'react'
import { WithTranslation, withTranslation } from 'react-i18next'
import {
  MaxWidthContainer,
  TablePagination,
  ToastType,
  Toast,
  LoadingStyled,
  Button,
} from '@loopring-web/component-lib'
import { useToast, NotificationItem } from '@loopring-web/core'

import {
  DeleteIcon,
  EmptyValueTag,
  NotificationIcon,
  ReadIcon,
  SoursURL,
  TOAST_TIME,
} from '@loopring-web/common-resources'
import { useNotification } from './hook'

const StylePaper = styled(Box)`
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;

  .content {
    width: 420px;
  }

  &.isMobile {
    .content {
      flex: 1;
      width: var(--swap-box-width);
    }
  }
`
const RowHeight = 95
const StyledPaper = styled(Box)`
  width: 100%;
  height: 100%;
  background: var(--color-box);
  border-radius: ${({ theme }) => theme.unit}px;
`

export const NotificationPanel = withTranslation(['common', 'layout'])(({ t }: WithTranslation) => {
  const container = React.useRef<HTMLDivElement>(null)
  const [pageSize, setPageSize] = React.useState(0)
  const { toastOpen, setToastOpen, closeToast } = useToast()
  const [filter, setFIter] = React.useState(undefined)
  const [page, setPage] = React.useState(1)
  const {
    showLoading,
    getNotification,
    rawData,
    total,
    unReads,
    onReadClick,
    onReadAllClick,
    onClearAllClick,
  } = useNotification({ setToastOpen })
  const handlePageChange = ({ page }: { page: number }) => {
    setPage(page)
    getNotification({ offset: page - 1, limit: pageSize, filter })
  }
  React.useEffect(() => {
    let height = container?.current?.offsetHeight
    if (height) {
      // const pageSize = Math.floor((height - 120) / RowConfig.rowHeight) - 3;
      setPageSize(Math.floor(height / RowHeight))
      // handleTabChange(currentTab, pageSize);
      // getNotification({})
      handlePageChange({ page: 1 })
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
          <Button
            startIcon={<ReadIcon color={'inherit'} fontSize={'small'} />}
            variant={'text'}
            size={'small'}
            sx={{ color: 'var(--color-text-primary)' }}
            onClick={onReadAllClick}
          >
            {t('labelNotificationReadAll')}
          </Button>
          <Button
            startIcon={<DeleteIcon color={'inherit'} fontSize={'small'} />}
            variant={'text'}
            size={'small'}
            sx={{ color: 'var(--color-text-primary)' }}
            onClick={onClearAllClick}
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
          ref={container}
        >
          <Grid container paddingBottom={2}>
            {rawData.length ? (
              rawData.map((ele, index) => {
                return (
                  <Grid item xs={12} key={ele.id}>
                    <NotificationItem {...ele} index={index} onReadClick={onReadClick} />
                    {index !== rawData?.length - 1 && <Divider />}
                  </Grid>
                )
              })
            ) : (
              <Typography
                color={'var(--color-text-third)'}
                whiteSpace={'break-spaces'}
                style={{ wordBreak: 'break-all' }}
                title={'ERC1155'}
                component={'span'}
              >
                {EmptyValueTag}
              </Typography>
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
          </Grid>
          <Box>
            {total > pageSize && (
              <TablePagination
                page={page}
                pageSize={pageSize}
                total={total}
                onPageChange={(page) => {
                  handlePageChange({ page })
                }}
              />
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
