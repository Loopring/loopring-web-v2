import { Trans, useTranslation } from 'react-i18next'
import { Box, Container, Link, Typography } from '@mui/material'
import styled from '@emotion/styled'
import { ErrorObject, SoursURL } from '@loopring-web/common-resources'
import { getContactInfo } from '@loopring-web/core'

const StyleBox = styled(Box)`
  background-image: url('${SoursURL}/images/error_bg.png');
  background-repeat: no-repeat;
  background-size: contain;
  background-position: bottom;
  white-space: pre-wrap;
` as typeof Box

export const ErrorPage = ({ messageKey }: ErrorObject) => {
  const { t } = useTranslation('error')
  const message = `labelConnectUs`
  return (
    <>
      <Container style={{ flex: 1, display: 'flex' }}>
        {/*style={{height: '100%' }}*/}
        <StyleBox
          flex={1}
          display={'flex'}
          alignItems={'flex-start'}
          justifyContent={'center'}
          flexDirection={'column'}
          marginTop={4}
          height={680}
          maxWidth={1200}
        >
          {/*<StyleBox>*/}
          <Box textAlign={'center'} position={'relative'} left={128} top={-64}>
            <Typography component={'h2'} variant={'h3'} whiteSpace={'pre-line'}>
              {t(messageKey)}
            </Typography>
            <Typography
              marginY={2}
              component={'p'}
              variant={'body1'}
              color={'textSecondary'}
              whiteSpace={'pre-line'}
            >
              <Trans i18nKey={message} ns={'error'}>
                If you believe this is indeed a bug, please
                <Link
                  component={'a'}
                  sx={{
                    display: 'inline-flex',
                  }}
                  onClick={(e) => {
                    window.open(getContactInfo(), '_blank')
                    window.opener = null
                    e.preventDefault()
                  }}
                >
                  &nbsp; contact us
                </Link>
                <br /> We would appreciate your feedback
              </Trans>
            </Typography>
          </Box>
        </StyleBox>
      </Container>
    </>
  )
}
