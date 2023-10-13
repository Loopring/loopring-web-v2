import {
  Box,
  Button as MuButton,
  IconButton,
  Link,
  ToggleButton,
  ToggleButtonGroup as MuToggleButtonGroup,
  useScrollTrigger,
  Zoom,
  Tabs as MuTabs,
} from '@mui/material'
import { ButtonProps, TGItemJSXInterface, ToggleButtonGroupProps } from './Interface'
import { TFunction, withTranslation, WithTranslation } from 'react-i18next'
import styled from '@emotion/styled'
import { BackIcon, CloseIcon, QRIcon, SoursURL } from '@loopring-web/common-resources'
import React from 'react'

const loadingSvg = SoursURL + 'svg/loading.svg'

export const Button = styled(MuButton)<ButtonProps>`
  && {
    line-height: 1em;

    &:hover {
      cursor: pointer;
    }
    &.MuiButton-outlined {
      background-color: transparent;
      :hover {
        border-color: var(--color-primary);
      }
    }

    &.MuiButton-root.Mui-disabled {
      color: var(--color-text-button-disabled);
      background-color: var(--color-button-disabled);
      ${({ loading, theme, loadingbg }) => {
        return loading === 'true'
          ? `
           color:transparent;
           background-color:${theme.colorBase.primary};
           background-color:${loadingbg};
           
           &::after{
            display: block;
            content: url(${loadingSvg});
            height: 40px;
            width: 40px;
            position: absolute;
            transform:scale(.55);
            display:flex;
            flex-direction:row;
            align-items: center;
            justify-content: center;
            color:#fff  
           }
           
       `
          : ''
      }}
    }

    &.disabledViewOnly {
      pointer-events: inherit;
    }
  }

  //&.disabled{
  //
  //}
` as (props: ButtonProps) => JSX.Element

export function ScrollTop({
  // anchorTopRef,
  ...props
}: {
  children: React.ReactElement
  // anchorTopRef?: React.Ref<any>;
}) {
  const { children } = props

  const trigger = useScrollTrigger({
    target: window ? window : undefined,
    disableHysteresis: true,
    threshold: 100,
  })

  const scrollToTop = React.useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const anchor =
      (event.currentTarget as HTMLDivElement).parentElement || //.ownerDocument || document
      document.querySelector('#back-to-top-anchor')
    if (anchor) {
      window.scrollTo(0, anchor?.offsetTop)
    }
  }, [])

  return (
    <Zoom in={trigger}>
      <Box
        position={'fixed'}
        role='presentation'
        bottom={24}
        right={24}
        zIndex={9999}
        display={'flex'}
        flexDirection={'column'}
        alignItems={'center'}
        onClick={scrollToTop}
        title={'go top'}
      >
        {children}
      </Box>
    </Zoom>
  )
}

export const MuToggleButtonGroupStyle = styled(MuToggleButtonGroup)`
  ${({ theme, size }) =>
    size !== 'small'
      ? `
      background: var(--color-box);
      padding: ${theme.unit / 2}px;
      padding-right: ${theme.unit / 4}px;
      box-shadow: var(--shadow3);
  `
      : ``};

  .MuiToggleButton-sizeSmall {
    background: var(--color-box);
    height: 2.4rem;
    font-size: 1.2rem;
    margin-right: ${({ theme }) => theme.unit}px;
    border: ${({ theme }) => theme.border.borderConfig({ c_key: 'var(--color-border)' })};
    color: var(--color-text-secondary);

    &:not(:first-of-type),
    &:not(:last-child) {
      border-color: var(--color-border);
    }

    &:hover {
      //backgroundColor: var(--color-box);
      // color: var(--color-primary);
      color: var(--color-text-button-select);
      border: ${({ theme }) => theme.border.borderConfig({ c_key: 'var(--color-border-hover)' })};
      background: var(--color-box);
      // &:not(:last-child), &:not(:first-of-type) {
      border: ${({ theme }) => theme.border.borderConfig({ c_key: 'var(--color-primary)' })};
      // }

      &.Mui-selected,
      &.Mui-selected {
        //background: var(--opacity);
        background: var(--color-box);
        // color: var(--color-primary);
        color: var(--color-text-button-select);
        border: ${({ theme }) => theme.border.borderConfig({ c_key: 'var(--color-primary)' })};
        /* border: ${({ theme }) =>
          theme.border.borderConfig({ c_key: 'var(--color-border-hover)' })}; */
      }
    }

    &.Mui-disabled {
      //background ;
      background: var(--opacity);
      color: var(--color-disable);
      border: 1px dashed var(--color-border);
    }

    &.Mui-selected,
    &.Mui-selected + &.Mui-selected {
      // color: var(--color-primary);
      color: var(--color-text-button-select) !important;
      background: var(--color-box) !important;
      //background:  var(--color-disable);
      border: ${({ theme }) => theme.border.borderConfig({ c_key: 'var(--color-primary)' })};
      /* border: ${({ theme }) =>
        theme.border.borderConfig({ c_key: 'var(--color-border-hover)' })}; */
    }
  }
` as typeof MuToggleButtonGroup

export const ToggleButtonGroup = withTranslation('common')(
  ({
    t,
    value,
    // handleChange,
    size = 'medium',
    tgItemJSXs,
    data,
    exclusive,
    onChange,
  }: { t: TFunction } & ToggleButtonGroupProps) => {
    const _handleChange = React.useCallback(
      (_e: React.MouseEvent<HTMLElement, MouseEvent>, value: any) => {
        // setValue(value)
        if (onChange) {
          onChange(_e, value)
        }
      },
      [],
    )
    if (data) {
      tgItemJSXs = data.map(({ value, key, disabled }) => {
        return { value, JSX: t(key), tlabel: t(key), disabled }
      })
    }
    return (
      <MuToggleButtonGroupStyle
        size={size}
        value={value}
        exclusive={exclusive}
        onChange={_handleChange}
      >
        {tgItemJSXs?.map(({ value, JSX, tlabel, disabled, key, notWrap }: TGItemJSXInterface) =>
          notWrap ? (
            <Box key={key ? key : value}>{JSX}</Box>
          ) : (
            <ToggleButton
              key={key ? key : value}
              value={value}
              aria-label={tlabel}
              disabled={disabled}
            >
              {JSX}
            </ToggleButton>
          ),
        )}
      </MuToggleButtonGroupStyle>
    )
  },
)

export const ModalCloseButton = ({
  onClose,
  className = '',
  closeIcon = <CloseIcon />,
  t,
}: {
  className?: string
  closeIcon?: JSX.Element
  onClose?: {
    bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void
  }['bivarianceHack']
} & { t: TFunction }) => {
  return (
    <Box
      className={`close-button ${className}`}
      alignSelf={'flex-end'}
      position={'absolute'}
      zIndex={99}
      marginTop={'-27px'}
      marginRight={1}
    >
      <IconButton
        size={'large'}
        aria-label={t('labelClose')}
        color={'inherit'}
        onClick={(event) => {
          // myLog("IconButton escapeKeyDown");
          onClose && onClose(event, 'escapeKeyDown')
        }}
      >
        {closeIcon}
      </IconButton>
    </Box>
  )
}

export const ModalCloseButtonPosition = ({
  onClose,
  className = '',
  closeIcon = <CloseIcon />,
  t,
  right,
  top,
}: {
  className?: string
  closeIcon?: JSX.Element
  onClose?: {
    bivarianceHack(event: {}, reason: 'backdropClick' | 'escapeKeyDown'): void
  }['bivarianceHack']
  right?: number
  top?: number
} & { t: TFunction }) => {
  return (
    <Box
      className={`close-button ${className}`}
      alignSelf={'flex-end'}
      position={'absolute'}
      zIndex={99}
      right={right}
      top={top}
    >
      <IconButton
        size={'large'}
        aria-label={t('labelClose')}
        color={'inherit'}
        onClick={(event) => {
          onClose && onClose(event, 'escapeKeyDown')
        }}
      >
        {closeIcon}
      </IconButton>
    </Box>
  )
}

export const ModalBackButton = ({
  onBack,
  t,
  marginTop = '-24px',
  marginLeft = 1.5,
}: {
  onBack?: () => void
  marginTop?: number | string
  marginLeft?: number | string
} & Partial<WithTranslation>) => {
  return (
    <Box alignSelf={'flex-start'} marginTop={marginTop} marginLeft={marginLeft}>
      <IconButton
        className={'back-btn'}
        size={'large'}
        color={'inherit'}
        aria-label={t && t('labelBack')}
        onClick={() => {
          onBack && onBack()
        }}
      >
        <BackIcon />
      </IconButton>
    </Box>
  )
}
const QRStyle = styled(Box)`
  .MuiButtonBase-root {
    position: relative;
    //z-index: 10;
  }

  &:after {
    pointer-events: none;
    content: '';
    position: absolute;
    display: block;
    height: 48px;
    width: 48px;
    top: -2px;
    left: -2px;
    //z-index: -1;
    background-image: ${({ theme }) => {
      if (theme.mode === 'dark') {
        return `url('${SoursURL}images/qr_code_dark.png')`
      } else {
        return `url('${SoursURL}images/qr_code_light.png')`
      }
    }};
  }
` as typeof Box
export const QRButtonStyle = ({
  onQRClick,
  t,
}: {
  onQRClick?: () => void
} & WithTranslation) => {
  return (
    <QRStyle
      alignSelf={'flex-start'}
      marginTop={(-1 / 2) * 7}
      marginLeft={1.5}
      position={'absolute'}
    >
      <IconButton
        size={'large'}
        aria-label={t('labelBack')}
        onClick={() => {
          onQRClick && onQRClick()
        }}
      >
        <QRIcon htmlColor={'var(--color-text-third)'} />
      </IconButton>
    </QRStyle>
  )
}
export const LinkActionStyle = styled(Link)`
  text-decoration: underline dotted;
  color: inherit;
` as typeof Link

export const Tabs = styled(MuTabs)`
  &.btnTab {
    .MuiTab-root {
      color: var(--color-text-primary);
      margin-right: ${({ theme }) => theme.unit}px;
      padding: ${({ theme }) => theme.unit}px ${({ theme }) => theme.unit * 1.5}px;
      min-height: auto;
      line-height: 24px;
      &.Mui-selected {
        color: var(--color-text-button);
        border-radius: ${({ theme }) => theme.unit * 0.5}px;
        background: var(--color-primary);
      }
    }
  }
`
