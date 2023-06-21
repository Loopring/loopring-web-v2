import {
  CollectionMeta,
  GET_IPFS_STRING,
  ImageIcon,
  LegacyIcon,
  SoursURL,
} from '@loopring-web/common-resources'
import { Theme, useTheme } from '@emotion/react'
import React from 'react'
import { Box, BoxProps, Typography } from '@mui/material'
import { cssBackground, EmptyDefault, MediaLabelStyled, NftImage, useImage } from '../../index'
import styled from '@emotion/styled'
import { useTranslation } from 'react-i18next'

const BoxStyle = styled(Box)<BoxProps & { theme: Theme }>`
  ${(props) => cssBackground(props)};
  width: 100%;
  //height: 100vw;
  position: relative;
  overflow: hidden;
` as (prosp: BoxProps & { theme: Theme }) => JSX.Element

export const CollectionMedia = React.memo(
  React.forwardRef(
    (
      {
        item,
        onRenderError,
        index,
        baseURL,
        getIPFSString,
        onClick,
      }: {
        item: Partial<CollectionMeta>
        index?: number
        onRenderError: (popItem: Partial<CollectionMeta>, index?: number) => void
        baseURL: string
        getIPFSString: GET_IPFS_STRING
        onClick?: (e: any) => void
        // isOrigin?: boolean;
        // shouldPlay?: boolean;
      },
      ref: React.ForwardedRef<any>,
    ) => {
      const theme = useTheme()
      const { t } = useTranslation()
      const { hasLoaded, hasError } = useImage(
        item?.cached?.tileUri ?? getIPFSString(item.tileUri, baseURL) ?? '',
      )

      React.useEffect(() => {
        if (hasError) {
          onRenderError(item, index)
        }
      }, [hasError, item, index])

      return (
        <BoxStyle
          ref={ref}
          theme={theme}
          flex={1}
          display={'flex'}
          alignItems={'center'}
          justifyContent={'center'}
          onClick={onClick}
          className={'media'}
        >
          {!hasLoaded ? (
            <Box
              flex={1}
              height={'100%'}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <img className='loading-gif' width='36' src={`${SoursURL}images/loading-line.gif`} />
            </Box>
          ) : (
            <Box
              alignSelf={'stretch'}
              position={'relative'}
              flex={1}
              display={'flex'}
              // style={{
              //   background:
              //     !!item.tileUri && !hasError ? "var(--field-opacity)" : "",
              // }}
            >
              {!!item.tileUri && !hasError ? (
                <NftImage
                  alt={'tile'}
                  {...item}
                  onError={() => onRenderError(item, index)}
                  src={item?.cached?.tileUri ?? getIPFSString(item.tileUri, baseURL)}
                />
              ) : (
                <EmptyDefault
                  style={{ flex: 1 }}
                  height={'100%'}
                  emptyPic={
                    <ImageIcon
                      htmlColor={'var(--color-text-third)'}
                      style={{ width: 80, height: 80 }}
                    />
                  }
                  message={() => (
                    <></>
                    // <Box
                    //   flex={1}
                    //   display={"flex"}
                    //   alignItems={"center"}
                    //   justifyContent={"center"}
                    // >
                    //   {t("labelNoCollectionCover")}
                    // </Box>
                  )}
                />
              )}
            </Box>
          )}
          {item.extra?.properties?.isLegacy ? (
            <MediaLabelStyled
              position={'absolute'}
              left={0}
              top={0}
              display={'flex'}
              alignItems={'center'}
              justifyContent={'center'}
              colorbg={'var(--color-warning)'}
            >
              <LegacyIcon color={'inherit'} htmlColor={'var(--color-text-button)'} />
              <Typography color={'var(--color-text-button)'} component={'span'} paddingLeft={1}>
                {t('labelLegacy')}
              </Typography>
            </MediaLabelStyled>
          ) : (
            ''
          )}
        </BoxStyle>
      )
    },
  ),
)
