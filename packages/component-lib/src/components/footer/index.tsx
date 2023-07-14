import styled from '@emotion/styled/macro'
import { Box, Container, Link, List, Typography } from '@mui/material'
import React from 'react'
import {
  DiscordIcon,
  FooterInterface,
  LoopringIcon,
  MediumIcon,
  TwitterIcon,
  YoutubeIcon,
} from '@loopring-web/common-resources'

import { WithTranslation, withTranslation } from 'react-i18next'
import { useTheme } from '@emotion/react'
import { useSettings } from '../../stores'

const LinkStyle = styled(Link)`
  color: var(--color-text-secondary);
  line-height: 20px;
  font-size: 12px;

  &:hover {
    color: var(--color-text-hover);
  }
` as typeof Link
const FooterDiv = styled(Box)`
  background: var(--color-global-bg);
`

export const Footer = withTranslation(['layout'])(
  ({
    t,
    linkListMap,
    mediaList,
    isLandingPage,
    isBeta = false,
  }: {
    isLandingPage: boolean
    linkListMap: { [key: string]: FooterInterface[] }
    mediaList: FooterInterface[]
    isBeta: boolean
  } & WithTranslation) => {
    const { mode } = useTheme()
    const { isMobile } = useSettings()
    React.useLayoutEffect(() => {
      function updateSize() {}

      window.addEventListener('resize', updateSize)
      updateSize()
      return () => window.removeEventListener('resize', updateSize)
    }, [])
    const linkListMapRender = React.useMemo(() => {
      return Reflect.ownKeys(linkListMap).map((key) => {
        return (
          <Box
            key={key.toString()}
            minWidth={120}
            display={'flex'}
            flexDirection={'column'}
            justifyContent={'center'} /* padding={3} */
          >
            <Typography
              color={'var(--color-text-third)'}
              sx={{ mt: 4, mb: 2 }}
              variant='body2'
              component='div'
            >
              {t('labelFooter' + key.toString())}
            </Typography>
            <Box
              display={'flex'}
              flexDirection={'column'}
              height={'100%'}
              justifyContent={'flex-start'}
            >
              {linkListMap[key.toString()].map((item: any) => {
                return (
                  <LinkStyle
                    key={item.linkName}
                    target='_blank'
                    rel='noopener noreferrer'
                    href={item.linkHref}
                  >
                    {t('label' + 'key' + item.linkName)}
                  </LinkStyle>
                )
              })}
            </Box>
          </Box>
        )
      })
    }, [linkListMap])

    const medias = React.useMemo(() => {
      const renderIcon = (name: string) => {
        switch (name) {
          case 'Discord':
            return <DiscordIcon fontSize={'large'} htmlColor={'var(--color-text-third)'} />
          case 'Twitter':
            return <TwitterIcon fontSize={'large'} htmlColor={'var(--color-text-third)'} />
          case 'Youtube':
            return <YoutubeIcon fontSize={'large'} htmlColor={'var(--color-text-third)'} />
          case 'Medium':
            return <MediumIcon fontSize={'large'} htmlColor={'var(--color-text-third)'} />
        }
      }
      return (
        <List
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            paddingTop: 0,
            paddingBottom: 0,
          }}
        >
          {mediaList.map((o, index) => (
            <Typography paddingRight={2} key={`${o.linkName}-${index}`}>
              <LinkStyle
                fontSize={28}
                display={'inline-block'}
                width={28}
                href={o.linkHref}
                target='_blank'
                rel='noopener noreferrer'
              >
                {renderIcon(o.linkName)}
              </LinkStyle>
            </Typography>
          ))}
        </List>
      )
    }, [mediaList])

    return (
      <FooterDiv component={'footer'} fontSize={'body1'}>
        {/*<Divider />*/}

        {!!(isLandingPage && !isMobile) ? (
          <Container>
            <>
              <Box
                position={'relative'}
                // height={size[ 1 ]}
                flexDirection='row'
                justifyContent='space-between'
                alignItems='center'
                width={'100%'}
                paddingBottom={4}
              >
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'flex-start'}>
                  <Box
                    marginTop={4}
                    marginLeft={-3}
                    minWidth={100}
                    alignSelf={'flex-start'}
                    justifySelf={'center'}
                    display={'inline-flex'}
                    alignItems={'center'}
                  >
                    <LoopringIcon
                      htmlColor={'var(--color-text-third)'}
                      style={{ height: '40px', width: '120px' }}
                    />
                  </Box>
                  {linkListMapRender}
                  <Box display={'flex'} flexDirection={'column'} width={168}>
                    <Typography
                      color='var(--color-text-third)'
                      variant='body2'
                      component='p'
                      sx={{ mt: 4, mb: 2 }}
                    >
                      Follow us
                    </Typography>
                    <Box>{medias}</Box>
                  </Box>
                </Box>
              </Box>
              <Typography
                fontSize={12}
                component={'p'}
                textAlign={'center'}
                paddingBottom={2}
                color={'var(--color-text-third)'}
              >
                {t('labelCopyRight', { year: new Date().getFullYear() })}
              </Typography>
            </>
          </Container>
        ) : (
          <Box
            height={isMobile ? 'auto' : 48}
            display={'flex'}
            justifyContent={'center'}
            alignItems={'center'}
            width={'100%'}
            style={{
              backgroundColor:
                mode === 'light' ? 'rgba(59, 90, 244, 0.05)' : 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <Container>
              <Box
                display={'flex'}
                flex={1}
                width={'100%'}
                justifyContent={'space-between'}
                alignItems={'center'}
                flexDirection={isMobile ? 'column' : 'row'}
              >
                <Typography
                  fontSize={12}
                  component={'span'}
                  color={isBeta ? 'var(--color-warning)' : 'var(--color-text-third)'}
                  paddingLeft={2}
                  paddingTop={isMobile ? 2 : 0}
                >
                  {isBeta
                    ? t('labelCopyRightBeta')
                    : t('labelCopyRight', { year: new Date().getFullYear() })}
                </Typography>
                <Box paddingY={isMobile ? 2 : 0}>{medias}</Box>
              </Box>
            </Container>
          </Box>
        )}
      </FooterDiv>
    )
  },
)
