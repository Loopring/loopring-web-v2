import { Box, ListItem, ListItemAvatar, ListItemProps, ListItemText } from '@mui/material'
import styled from '@emotion/styled'
import {
  Account,
  ACTIVITY,
  hexToRGB,
  languageMap,
  NOTIFICATION_ITEM,
  NOTIFY_COLOR,
  ThemeType,
} from '@loopring-web/common-resources'
import { css, Theme } from '@emotion/react'
import { useHistory } from 'react-router-dom'
import { useSettings } from '../../../stores'
import * as sdk from '@loopring-web/loopring-sdk'

const cssBackground = ({
  theme,
  color,
  banner,
  bannerDark,
  lng,
}: { theme: Theme; lng: string } & Partial<NOTIFICATION_ITEM>) => {
  let svg: string, _color: string
  const fillColor = theme.colorBase.textDisable
  const _banner: string | undefined =
    theme.mode === ThemeType.dark && bannerDark?.length ? bannerDark : banner
  const opacity = 0.2
  if (banner) {
    return css`
      text-indent: -99999em;

      &,
      &:hover {
        background: url('${_banner?.replace('{lng}', lng)}');
        background-size: cover;
      }

      &:hover {
        filter: blur(0.6px);
        box-shadow: var(--shadow-hover);
      }
    `
  }
  switch (color) {
    case NOTIFY_COLOR.primary:
      _color = theme.colorBase.warning
      svg =
        encodeURI(`<svg width="88" height="88" viewBox="0 0 88 88" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg">
<g opacity="${opacity}">
<path d="M15.4 28.6005L22 28.6005L22 37.4005L15.4 37.4005C11.7549 37.4005 8.8 40.3554 8.8 44.0005C8.8 47.6456 11.7549 50.6005 15.4 50.6005L44 50.6005L44 59.4005L15.4 59.4005C6.89482 59.4005 -7.13936e-07 52.5057 -5.98288e-07 44.0005C-4.8264e-07 35.4953 6.89482 28.6005 15.4 28.6005Z" />
<path d="M66 59.4005L72.6 59.4005C81.1052 59.4005 88 52.5057 88 44.0005C88 35.4953 81.1052 28.6005 72.6 28.6005L44 28.6005L44 37.4005L72.6 37.4005C76.2451 37.4005 79.2 40.3554 79.2 44.0005C79.2 47.6456 76.2451 50.6005 72.6 50.6005L66 50.6005L66 59.4005Z" />
<path d="M28.6 72.6L28.6 66L37.4 66L37.4 72.6C37.4 76.2451 40.3549 79.2 44 79.2C47.6451 79.2 50.6 76.2451 50.6 72.6L50.6 44L59.4 44L59.4 72.6C59.4 81.1052 52.5052 88 44 88C35.4948 88 28.6 81.1052 28.6 72.6Z" />
<path d="M59.4 22L59.4 15.4C59.4 6.89481 52.5052 3.42155e-07 44 5.98281e-07C35.4948 8.54407e-07 28.6 6.89482 28.6 15.4L28.6 44L37.4 44L37.4 15.4C37.4 11.7549 40.3549 8.8 44 8.8C47.6451 8.8 50.6 11.7549 50.6 15.4L50.6 22L59.4 22Z" />
</g>
</svg>`)
      break
    case NOTIFY_COLOR.secondary:
      _color = theme.colorBase.success
      svg =
        encodeURI(`<svg width="80" height="88" viewBox="0 0 80 88" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg">
<path opacity="${opacity}" d="M17.6 88L4.78625e-07 70.4L17.6 52.8L17.6 66L61.6 66L61.6 48.4L70.4 48.4L70.4 70.4C70.4 72.8301 68.43 74.8 66 74.8L17.6 74.8L17.6 88ZM17.6 39.6L8.8 39.6L8.8 17.6C8.8 15.1699 10.7699 13.2 13.2 13.2L61.6 13.2L61.6 -4.18797e-07L79.2 17.6L61.6 35.2L61.6 22L17.6 22L17.6 39.6Z" />
</svg>`)
      break
    case NOTIFY_COLOR.tertiary:
      _color = theme.colorBase.error
      svg =
        encodeURI(`<svg width="87" height="88" viewBox="0 0 87 88" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg">
<path opacity="${opacity}"  fill-rule="evenodd" clip-rule="evenodd" d="M9.66409 88H77.3127C82.6501 88 86.9767 84.0602 86.9767 79.2V17.6C86.9767 12.7399 82.6501 8.8 77.3127 8.8H67.6486V0H57.9845V8.8H28.9923V0H19.3282V8.8H9.66409C4.32676 8.8 0 12.7399 0 17.6V79.2C0 84.0602 4.32676 88 9.66409 88ZM9.66409 79.2V35.2H77.3127V79.2H9.66409ZM9.66409 26.4V17.6H77.3127V26.4H9.66409ZM28.2823 53.1683L28.2823 53.1683L35.1158 46.9458L41.9493 53.1683L46.0493 56.9017L51.5163 51.9236L44.7886 45.7975L66.3845 44.6081L65.0784 64.2731L58.3498 58.1461L52.8828 63.1242L46.0493 69.3467L39.2158 63.1241L35.1158 59.3908L24.1822 69.3471L17.3487 63.1242L28.2823 53.1683Z"/>
</svg>`)
      break
    case NOTIFY_COLOR.default:
      _color = theme.colorBase.primary
      svg =
        encodeURI(`<svg width="102" height="88" viewBox="0 0 102 88" fill="${fillColor}" xmlns="http://www.w3.org/2000/svg">
<path opacity="${opacity}" d="M64.8421 2.86449e-05C68.0948 -0.000358379 71.2902 0.85563 74.1072 2.48192C76.9241 4.10822 79.2632 6.4475 80.8893 9.26454C82.5154 12.0816 83.3712 15.2771 83.3706 18.5298C83.37 21.7825 82.513 24.9777 80.8859 27.7941L101.895 27.7895V37.0526H92.6315V83.3684C92.6315 84.5968 92.1436 85.7749 91.275 86.6434C90.4064 87.512 89.2283 88 88 88H13.8947C12.6664 88 11.4883 87.512 10.6197 86.6434C9.75112 85.7749 9.26315 84.5968 9.26315 83.3684V37.0526H0V27.7895L21.0088 27.7941C18.7109 23.8151 17.9737 19.1241 18.9403 14.632C19.9069 10.1399 22.5083 6.16728 26.2394 3.48553C29.9706 0.803779 34.5651 -0.395741 39.131 0.119888C43.6969 0.635517 47.9083 2.8295 50.9473 6.27582C52.6823 4.2999 54.8196 2.71772 57.216 1.63534C59.6125 0.552957 62.2126 -0.00460494 64.8421 2.86449e-05ZM46.3158 37.0526H18.5263V78.7368H46.3158V37.0526ZM83.3684 37.0526H55.5789V78.7368H83.3684V37.0526ZM37.0526 9.26318C34.6489 9.25243 32.3351 10.1765 30.6001 11.8401C28.8651 13.5037 27.8447 15.7766 27.7545 18.1787C27.6643 20.5807 28.5114 22.9238 30.1168 24.7128C31.7222 26.5019 33.9601 27.5968 36.3579 27.7663L37.0526 27.7895H46.3158V18.5263C46.3159 16.3127 45.5232 14.1723 44.0815 12.4926C42.6397 10.8129 40.644 9.70507 38.456 9.36971L37.7427 9.28634L37.0526 9.26318ZM64.8421 9.26318C62.5051 9.26244 60.2542 10.1451 58.5406 11.7341C56.827 13.3232 55.7774 15.5012 55.6021 17.8316L55.5789 18.5263V27.7895H64.8421C67.1791 27.7902 69.43 26.9076 71.1436 25.3186C72.8572 23.7295 73.9068 21.5515 74.0821 19.2211L74.1052 18.5263C74.1052 16.0696 73.1293 13.7135 71.3921 11.9763C69.6549 10.2391 67.2988 9.26318 64.8421 9.26318Z" />
</svg>
`)
      break
    default:
      _color = theme.colorBase.box
      svg = ''
  }
  return css`
    &,
    &:hover {
      background-color: ${hexToRGB(_color, 0.25)};
      background-image: url('data:image/svg+xml, ${svg}');
      background-repeat: no-repeat;
      background-position-x: 100%;
    }
    &:hover {
      background-color: ${hexToRGB(_color, 0.45)};
    }
  `
}

const NotificationListItemStyled = styled(ListItem)<
  ListItemProps & Partial<ACTIVITY> & { lng: string; bannerDark: string }
>`
  cursor: pointer;
  height: var(--notification-activited-heigth);
  width: calc(var(--notification-activited-heigth) * 327 / 80);
  overflow: hidden;
  padding: ${({ theme }) => theme.unit}px ${({ theme }) => theme.unit}px;
  background-color: var(--opacity);

  &:not(:last-child) {
    border-bottom: 1px solid var(--color-divide);
    // margin-bottom: ${({ theme }) => theme.unit}px;
  }

  .MuiListItemText-root {
    margin-top: 0;
  }

  .description {
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
    width: 100%;
  }

  .MuiListItemAvatar-root {
    width: 1em;
    height: 100%;
  }

  ${(props) => cssBackground(props)}
` as (props: ListItemProps & Partial<ACTIVITY> & { lng: string }) => JSX.Element

export const NotificationListItem = (
  props: Partial<NOTIFICATION_ITEM> & {
    account?: Account
    chainId: sdk.ChainId
  },
) => {
  const history = useHistory()
  const { language } = useSettings()
  const lng = languageMap[language]
  const {
    title,
    description1,
    description2,
    account,
    banner,
    bannerDark,
    webRouter,
    link,
    linkParam,
    chainId,
  } = props
  return (
    <NotificationListItemStyled
      {...{ lng, banner, bannerDark }}
      alignItems='flex-start'
      onClick={() => {
        const hasParamTag = /\?/.test(link ?? '')
        let params = ''
        if (linkParam) {
          params = linkParam.split('&').reduce((pre, ele) => {
            const [key, value] = ele.split('=')
            const [_, valueKey] = value.match(/\{(.*)\}/) ?? []
            let _value: any = ''
            switch (valueKey) {
              case 'chainId':
                _value = chainId
                break
              case 'l2address':
                _value = account?.accAddress
                break
            }
            return `${pre}&${key}=${_value}`
          }, '')
        }
        if (webRouter) {
          const [_, target, router] = webRouter.match(/\[(.*)\](.*)/i) ?? []
          if (router && target === 'self') {
            history.push(router)
          } else {
            window.open(
              router
                ? `https://loopring.io/#/${router}`
                : `${link}${hasParamTag ? '' : '?'}` + `${params}`,
              '_blank',
            )
            window.opener = null
          }
        } else if (link) {
          window.open(`${link}${hasParamTag ? '' : '?'}` + `${params}`, '_blank')
          window.opener = null
        }
      }}
      className={`notification`}
    >
      <ListItemAvatar />
      <Box
        className={'notification-content'}
        component={'section'}
        display={'flex'}
        alignItems={'flex-start'}
        flexDirection={'column'}
        overflow={'hidden'}
      >
        <ListItemText
          className={'title'}
          primary={<span dangerouslySetInnerHTML={{ __html: title ?? '' }} />}
          primaryTypographyProps={{
            component: 'h4',
            color: 'textPrimary',
            title,
          }}
        />
        <ListItemText
          className='description description1'
          primary={<span dangerouslySetInnerHTML={{ __html: description1 ?? '' }} />}
          primaryTypographyProps={{
            component: 'p',
            variant: 'body1',
            textOverflow: 'ellipsis',
            title: description1,
            color: 'textPrimary',
            overflow: 'hidden',
          }}
        />
        <ListItemText
          className='description description2'
          primary={<span dangerouslySetInnerHTML={{ __html: description2 ?? '' }} />}
          primaryTypographyProps={{
            component: 'p',
            variant: 'body2',
            textOverflow: 'ellipsis',
            title: description2,
            color: 'textSecondary',
            overflow: 'hidden',
          }}
        />
      </Box>
    </NotificationListItemStyled>
  )
}

const ListItemActivityStyle = styled(NotificationListItemStyled)<
  ListItemProps & Partial<ACTIVITY> & { lng: string }
>`
  &:not(:last-child) {
    border-bottom: 0;
    margin-bottom: ${({ theme }) => theme.unit}px;
  }

  padding: ${({ theme }) => theme.unit}px;
  ${(props) => cssBackground(props)}
  border-radius: ${({ theme }) => theme.unit}px;
` as (props: ListItemProps & Partial<ACTIVITY> & { lng: string }) => JSX.Element
export const ListItemActivity = (props: ACTIVITY & { account?: Account; chainId: sdk.ChainId }) => {
  const {
    type,
    title,
    description1,
    description2,
    startShow,
    link,
    account,
    banner,
    color,
    webRouter,
    linkParam,
    chainId,
  } = props
  const { language } = useSettings()
  const lng = languageMap[language]
  const history = useHistory()
  if (Date.now() > startShow) {
    return (
      <ListItemActivityStyle
        {...{ banner, color, lng }}
        className={type}
        // onClick={() =>
        //   history.replace(``)
        // }
        onClick={() => {
          const hasParamTag = /\?/.test(link)
          let params = ''
          if (linkParam) {
            params = linkParam.split('&').reduce((pre, ele) => {
              const [key, value] = ele.split('=')
              const [_, valueKey] = value.match(/\{(.*)\}/) ?? []
              let _value: any = ''
              switch (valueKey) {
                case 'chainId':
                  _value = chainId
                  break
                case 'l2address':
                  _value = account?.accAddress
                  break
              }
              return `${pre}&${key}=${_value}`
            }, '')
          }
          if (webRouter) {
            const [_, target, router] = webRouter.match(/\[(.*)\](.*)/i) ?? []
            if (router && target === 'self') {
              history.push(router)
            } else {
              window.open(
                router
                  ? `https://loopring.io/#/${router}`
                  : `${link}${hasParamTag ? '' : '?'}` + `${params}`,
                '_blank',
              )
              window.opener = null
            }
          } else if (link) {
            window.open(`${link}${hasParamTag ? '' : '?'}` + `${params}`, '_blank')
            window.opener = null
          }
        }}
        type={props.type}
      >
        <ListItemAvatar />
        <Box
          className={'activity-content'}
          component={'section'}
          display={'flex'}
          alignItems={'flex-start'}
          flexDirection={'column'}
          overflow={'hidden'}
        >
          <ListItemText
            primary={title}
            primaryTypographyProps={{
              component: 'h6',
              variant: 'subtitle1',
              title: title,
              color: 'textPrimary',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          />
          <ListItemText
            className='description description1'
            primary={description1}
            primaryTypographyProps={{
              component: 'p',
              title: description1,
              variant: 'body1',
              color: 'textPrimary',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          />
          <ListItemText
            className='description description2'
            primary={description2}
            primaryTypographyProps={{
              component: 'p',
              title: description2,
              variant: 'body2',
              color: 'textSecondary',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          />
        </Box>
      </ListItemActivityStyle>
    )
  } else {
    return <></>
  }
}
