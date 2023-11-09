import React from 'react'
import { withTranslation, WithTranslation } from 'react-i18next'
import {
  Box,
  BoxProps,
  Card,
  CardContent,
  Container,
  Fab,
  Grid,
  Link,
  Typography,
} from '@mui/material'
import styled from '@emotion/styled'
import { LoadingBlock, ScrollTop } from '@loopring-web/component-lib'
import { EVENT_STATUS, useTradeRace } from './hook'
import {
  EmptyValueTag,
  GoTopIcon,
  MarkdownStyle,
  YEAR_DAY_SECOND_FORMAT,
} from '@loopring-web/common-resources'

import { RankRaw } from './rank'
import moment from 'moment'
import ReactMarkdown from 'react-markdown'
import gfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useTheme } from '@emotion/react'
import { EventData } from './interface'

const CardStyled = styled(Card)`
  // min-height: ${({ theme }) => theme.unit * 61.5}px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
`
const LayoutStyled = styled(Box)<BoxProps & { eventData: EventData }>`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  ${({ eventData: { showBannerOrTitle, banner } }) => {
    if (showBannerOrTitle == '1' && banner.laptop) {
      return `
          margin-top:0;
          .title-banner {        
            h1,
            h2 {
             overflow: hidden;
             text-indent:-999999em; 
            }
            width:100%;
            min-height: 65.6vw; 
            background-position:50%;
            background-size: cover;
            background-repeat: no-repeat;
            background-image: url(${banner.pad});
            @media only screen and (max-width: 600px) {
                background-image: url(${banner.mobile});
            }
            @media only screen and (max-width: 992px) {
              background-image: url(${banner.pad});
            };
            @media only screen and (min-width: 1200px) {
              background-image: url(${banner.laptop});
              min-height: 280px;
            }
          }`
    }
  }}
  ol,
  ul {
    list-style: dismal;
    font-size: ${({ theme }) => theme.fontDefault.body1};
    margin-left: ${({ theme }) => theme.unit * 2}px;

    li {
      color: var(--color-text-secondary);
    }

    li ::marker {
      content: '  ' counter(list-item) ')  ';
      display: inline-flex;
      color: var(--color-text-secondary);
    }
  }

  .hours,
  .minutes {
    position: relative;

    span:after {
      display: block;
      content: ':';
      position: absolute;
      right: -8px;
      top: 0;
    }
  }
` as (props: BoxProps & { eventData: EventData }) => JSX.Element
// ${cssStyle}

export const TradeRacePage = withTranslation('common')(({ t }: WithTranslation) => {
  const { eventData, countDown, scrollToRule, eventStatus, eventsList, searchParams, match } =
    useTradeRace()
  const theme = useTheme()
  const anchorRef = React.useRef()
  const anchorTopRef = React.createRef()

  // const history = useHistory();

  // myLog("activityRule", eventStatus, activityRule);
  /*remove: holiday only end
      const flakes = 160;
      const flake = React.useMemo(() => {
        return <div className={"flake"} />;
      }, []);
      const snows = new Array(flakes).fill(flake, 0, flakes);
    */
  return (
    <>
      {eventData ? (
        <>
          <LayoutStyled
            ref={anchorTopRef}
            marginY={4}
            eventData={eventData}
            flex={1}
            id={'tradeRaceTop'}
          >
            <ScrollTop>
              <Fab color='primary' size={'large'} aria-label='scroll back to top'>
                <GoTopIcon htmlColor={'var(--color-text-button)'} />
              </Fab>
            </ScrollTop>
            <Box className={'title-banner'} marginBottom={4}>
              <Typography
                marginY={1}
                component={'h1'}
                variant={'h1'}
                whiteSpace={'pre-line'}
                textAlign={'center'}
                dangerouslySetInnerHTML={{ __html: eventData.eventTitle }}
              />

              <Typography
                component={'h2'}
                variant={'h2'}
                whiteSpace={'pre-line'}
                textAlign={'center'}
                dangerouslySetInnerHTML={{ __html: eventData.subTitle }}
              />
            </Box>

            {eventStatus && (
              <Box component={'section'} paddingX={3} marginBottom={4} textAlign={'center'}>
                <Typography
                  component={'h2'}
                  variant={'h4'}
                  marginBottom={2}
                  color={'var(--color-text-secondary)'}
                >
                  {t(eventStatus)}
                </Typography>
                {eventStatus !== EVENT_STATUS.EVENT_END && (
                  <Box display={'flex'} flexDirection={'row'} alignItems={'center'}>
                    <Box
                      className={'day'}
                      display={'flex'}
                      flexDirection={'column'}
                      minWidth={86}
                      alignItems={'center'}
                      marginRight={2}
                    >
                      <Typography
                        variant={'h2'}
                        component={'span'}
                        color={'var(--color-text-primary)'}
                      >
                        {Number(countDown?.days) >= 0 ? countDown?.days : EmptyValueTag}
                      </Typography>
                      <Typography
                        variant={'h4'}
                        color={'var(--color-text-secondary)'}
                        marginTop={1}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {t('labelDay')}
                      </Typography>
                    </Box>
                    <Box
                      className={'hours'}
                      display={'flex'}
                      minWidth={86}
                      flexDirection={'column'}
                      alignItems={'center'}
                      marginRight={2}
                    >
                      <Typography
                        variant={'h2'}
                        component={'span'}
                        color={'var(--color-text-primary)'}
                      >
                        {Number(countDown?.hours) >= 0 ? countDown?.hours : EmptyValueTag}
                      </Typography>
                      <Typography
                        variant={'h4'}
                        color={'var(--color-text-secondary)'}
                        marginTop={1}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {t('labelHours')}
                      </Typography>
                    </Box>
                    <Box
                      className={'minutes'}
                      display={'flex'}
                      minWidth={86}
                      flexDirection={'column'}
                      alignItems={'center'}
                      marginRight={2}
                    >
                      <Typography
                        variant={'h2'}
                        component={'span'}
                        color={'var(--color-text-primary)'}
                      >
                        {Number(countDown?.minutes) >= 0 ? countDown?.minutes : EmptyValueTag}
                      </Typography>
                      <Typography
                        variant={'h4'}
                        color={'var(--color-text-secondary)'}
                        marginTop={1}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {t('labelMinutes')}
                      </Typography>
                    </Box>
                    <Box
                      className={'secondary'}
                      display={'flex'}
                      minWidth={86}
                      flexDirection={'column'}
                      alignItems={'center'}
                      marginRight={2}
                    >
                      <Typography
                        variant={'h2'}
                        component={'span'}
                        color={'var(--color-text-primary)'}
                      >
                        {Number(countDown?.seconds) >= 0 ? countDown?.seconds : EmptyValueTag}
                      </Typography>
                      <Typography
                        variant={'h4'}
                        color={'var(--color-text-secondary)'}
                        marginTop={1}
                        style={{ textTransform: 'uppercase' }}
                      >
                        {t('labelSeconds')}
                      </Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            )}
            {eventData.duration && (
              <Typography marginBottom={2} paddingX={3} variant={'body1'}>
                {eventData?.duration?.prev}
                <Typography
                  component={'time'}
                  paddingX={1}
                  variant={'h5'}
                  dateTime={eventData.duration.startDate.toFixed()}
                >
                  {moment(eventData.duration.startDate).utc().format(YEAR_DAY_SECOND_FORMAT)}
                </Typography>
                <Typography component={'span'} variant={'h5'}>
                  {eventData?.duration?.middle}
                </Typography>
                <Typography
                  component={'time'}
                  paddingX={1}
                  variant={'h5'}
                  dateTime={eventData.duration.endDate.toFixed()}
                >
                  {moment(eventData.duration.endDate).utc().format(YEAR_DAY_SECOND_FORMAT)}
                </Typography>
                {eventData?.duration?.timeZone && `(${eventData?.duration?.timeZone})`}{' '}
                {eventData?.duration?.end}
                <Typography marginLeft={1} component={'span'}>
                  <Link onClick={(e) => scrollToRule(e)}>{t('labelTradeReadRule')}</Link>
                </Typography>
              </Typography>
            )}
            {!!(
              !searchParams.has('rule') &&
              eventData.api &&
              eventData.api.version &&
              eventStatus !== EVENT_STATUS.EVENT_READY
            ) && <RankRaw {...eventData.api} />}

            <Box
              ref={anchorRef}
              maxWidth={1200}
              width={'100%'}
              paddingX={3}
              marginTop={3}
              id={'event-rule'}
            >
              {eventData.ruleMarkdown ? (
                <MarkdownStyle
                  container
                  minHeight={'calc(100% - 260px)'}
                  flex={1}
                  marginTop={3}
                  marginBottom={2}
                >
                  <Box
                    flex={1}
                    padding={3}
                    boxSizing={'border-box'}
                    className={`${theme.mode}  ${theme.mode}-scheme markdown-body MuiPaper-elevation2 no-bg`}
                  >
                    <ReactMarkdown
                      remarkPlugins={[gfm, ...(eventData.rehypeRaw == '1' ? [rehypeRaw] : [])]}
                      children={eventData.ruleMarkdown}
                    />
                  </Box>
                </MarkdownStyle>
              ) : (
                <LoadingBlock />
              )}
            </Box>
          </LayoutStyled>
        </>
      ) : eventsList.length ? (
        <Container
          maxWidth='lg'
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Grid container spacing={2} flex={1} marginTop={2}>
            {eventsList.map((item, index) => (
              <Grid item sm={12} md={6} lg={4} key={item.type}>
                <Link
                  onClick={() => {
                    searchParams.set('type', item.type)
                    // window.opene
                    window.open(`./#${match.url}?` + searchParams.toString(), '_self')
                    window.opener = null
                    window.location.reload()
                    // history.push(match.url + "?" );
                  }}
                >
                  <CardStyled>
                    <CardContent style={{ paddingBottom: 0 }}>
                      <Box
                        display={'flex'}
                        flexDirection={'column'}
                        justifyContent={'space-between'}
                        alignItems={'flex-start'}
                      >
                        <Typography
                          variant={'h3'}
                          component={'p'}
                          color={'textPrimary'}
                          fontFamily={'Roboto'}
                          textAlign={'center'}
                          width={'100%'}
                          dangerouslySetInnerHTML={{
                            __html: item.eventTitle,
                          }}
                        />
                        <Typography
                          component={'h2'}
                          variant={'body1'}
                          whiteSpace={'pre-line'}
                          textAlign={'left'}
                          marginTop={2}
                          paddingX={3}
                          dangerouslySetInnerHTML={{ __html: item.subTitle }}
                        />
                        {item.duration && (
                          <Typography
                            marginBottom={2}
                            paddingX={3}
                            variant={'body1'}
                            marginTop={1}
                            textAlign={'left'}
                          >
                            {item?.duration?.prev}
                            <Typography
                              component={'time'}
                              paddingX={1}
                              variant={'inherit'}
                              dateTime={item.duration.startDate.toFixed()}
                            >
                              {moment(item.duration.startDate).utc().format(YEAR_DAY_SECOND_FORMAT)}
                            </Typography>
                            <Typography component={'span'} variant={'inherit'}>
                              {item?.duration?.middle}
                            </Typography>
                            <Typography
                              component={'time'}
                              paddingX={1}
                              variant={'inherit'}
                              dateTime={item.duration.endDate.toFixed()}
                            >
                              {moment(item.duration.endDate).utc().format(YEAR_DAY_SECOND_FORMAT)}
                            </Typography>
                            {item?.duration?.timeZone && `(${item?.duration?.timeZone})`}{' '}
                            {item?.duration?.end}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </CardStyled>
                </Link>
              </Grid>
            ))}
          </Grid>
        </Container>
      ) : (
        <LoadingBlock />
      )}
    </>
  )
})
