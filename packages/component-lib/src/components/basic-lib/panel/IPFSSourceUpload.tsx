import {
  Box,
  ButtonProps,
  FormControl,
  FormHelperText,
  IconButton,
  Link,
  Typography,
  TypographyProps,
} from '@mui/material'
import { DropzoneOptions, useDropzone } from 'react-dropzone'
import styled from '@emotion/styled'
import {
  AudioIcon,
  CloseIcon,
  ErrorIcon,
  GET_IPFS_STRING,
  hexToRGB,
  ImageIcon,
  Media,
  myLog,
  PlayIcon,
  SoursURL,
  ThreeDIcon,
  VideoIcon,
} from '@loopring-web/common-resources'
import { useTranslation } from 'react-i18next'
import React from 'react'
import { useTheme } from '@emotion/react'
import { NftImage } from '../media'

export const TYPES = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png']
export const MediaTYPES = [
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'image/png',
  'audio/mp3',
  'audio/mpeg',
  'video/mp4',
  'video/mpeg4',
  'model',
  'model/glb',
  '',
]
export const getMediaType = (type: string): Media | undefined => {
  if (/audio/gi.test(type ?? '')) {
    return Media.Audio
  }
  if (/video/gi.test(type ?? '')) {
    return Media.Video
  }
  if (/(model)/gi.test(type ?? '')) {
    return Media.Media3D
  }
  if (/image/gi.test(type ?? '')) {
    return Media.Image
  }
  return
}

const BoxStyle = styled(Box)`
  ${({ theme }) =>
    theme.border.defaultFrame({
      c_key: theme.colorBase.divide,
      d_W: 0,
      d_R: 1,
    })};
  background: ${({ theme }) => theme.colorBase.globalBg};
  width: 100%;
  height: 100%;
  border-style: dashed;
  .MuiFormHelperText-sizeMedium {
    font-size: ${({ theme }) => theme.fontDefault.body2};
    color: var(--color-error);
  }
  opacity: 0.8;
  &.focused,
  &:hover {
    opacity: 0.95;
  }
` as typeof Box
const LinkStyle = styled(Link)`
  ${({ theme }) =>
    theme.border.defaultFrame({
      c_key: theme.colorBase.divide,
      d_W: 0,
      d_R: 1,
    })};

  .media-content {
    height: 100%;
    width: 100%;
  }
` as typeof Link

export type IpfsFile = {
  file: File
  isProcessing: boolean
  error:
    | {
        [key: string]: any
      }
    | undefined
  uniqueId: string
  isUpdateIPFS: boolean
  cid?: string
  localSrc?: string
  fullSrc?: string
}
export const IPFS_INIT: Partial<IpfsFile> = {
  file: undefined,
  isProcessing: false,
  error: undefined,
  isUpdateIPFS: false,
}
export const MediaSVGToggle = ({
  url,
  play,
  getIPFSString,
  baseURL,
  mediaTyp,
  setPlay,
  isShow,
  shouldPlay = false,
}: {
  url: string
  play: boolean
  getIPFSString: GET_IPFS_STRING
  baseURL: string
  mediaTyp: Media | undefined
  setPlay: (props: boolean) => void
  isShow: boolean
  shouldPlay: boolean
}) => {
  const theme = useTheme()
  const vidRef = React.useRef<HTMLVideoElement>(null)
  const aidRef = React.useRef<HTMLAudioElement>(null)
  const d3Ref = React.useRef<HTMLAudioElement>(null)
  const typeSvg = React.useMemo(() => {
    myLog('item.__mediaType__', mediaTyp)
    switch (mediaTyp) {
      case Media.Audio:
        return (
          <>
            <Box
              position={'absolute'}
              right={theme.unit}
              bottom={theme.unit}
              borderRadius={'50%'}
              sx={{ background: 'var(--color-box)' }}
              padding={3 / 2}
              display={'inline-flex'}
              alignItems={'center'}
              justifyContent={'center'}
              zIndex={100}
            >
              <AudioIcon fontSize={'large'} htmlColor={'var(--text-third)'} />
            </Box>
            {url && shouldPlay && (
              <Box
                position={'absolute'}
                left={'50%'}
                bottom={theme.unit}
                display={'flex'}
                alignItems={'flex-end'}
                justifyContent={'center'}
                sx={{ transform: 'translateX(-50%)' }}
                zIndex={100}
                className={'media-content'}
              >
                <audio
                  src={getIPFSString(url, baseURL)}
                  ref={aidRef}
                  controls
                  loop
                  className='w-full rounded-none h-12'
                  controlsList='nodownload'
                />
              </Box>
            )}
          </>
        )
      case Media.Video:
        return (
          <>
            <Box
              position={'absolute'}
              right={theme.unit}
              bottom={theme.unit}
              borderRadius={'50%'}
              sx={{ background: 'var(--color-box)' }}
              padding={3 / 2}
              display={'inline-flex'}
              alignItems={'center'}
              justifyContent={'center'}
              zIndex={100}
            >
              <VideoIcon fontSize={'large'} htmlColor={'var(--text-third)'} />
            </Box>

            {url && shouldPlay && (
              <Box
                position={'absolute'}
                left={'50%'}
                top={'50%'}
                zIndex={100}
                width={'100%'}
                sx={{
                  transform: 'translate(-50% , -50%)',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setPlay(true)
                }}
                className={'media-content'}
              >
                <Box display={'flex'} alignItems={'center'} justifyContent={'center'} flex={1}>
                  {play ? (
                    <video
                      ref={vidRef}
                      src={getIPFSString(url, baseURL)}
                      autoPlay
                      muted
                      controls
                      loop
                      controlsList='nodownload'
                      style={{ width: '100%' }}
                    />
                  ) : (
                    <PlayIconStyle
                      sx={{
                        minHeight: 72,
                        minWidth: 72,
                      }}
                      // width={60}
                      // height={60}
                      // htmlColor={"var(--color-text-disable)"}
                    />
                  )}
                </Box>
              </Box>
            )}
          </>
        )
      case Media.Media3D:
        return (
          <>
            <Box
              position={'absolute'}
              right={theme.unit}
              bottom={theme.unit}
              borderRadius={'50%'}
              sx={{ background: 'var(--color-box)' }}
              padding={3 / 2}
              display={'inline-flex'}
              alignItems={'center'}
              justifyContent={'center'}
              zIndex={100}
            >
              <ThreeDIcon fontSize={'large'} htmlColor={'var(--text-third)'} />
            </Box>

            {url && shouldPlay && (
              <Box
                position={'absolute'}
                left={'50%'}
                top={'50%'}
                zIndex={100}
                height={'100%'}
                width={'100%'}
                sx={{
                  transform: 'translate(-50% , -50%)',
                  cursor: 'pointer',
                  background: 'var(--color-global-bg)',
                }}
                className={'media-content'}
              >
                <model-viewer
                  style={{ height: '100%', width: '100%' }}
                  src={getIPFSString(url, baseURL)}
                  ref={d3Ref}
                  autoPlay
                  auto-rotate
                  camera-controls
                  controls
                  loop
                  ar-modes='webxr scene-viewer quick-look'
                  loading='eager'
                  touch-action='pan-y'
                  shadow-intensity='1'
                />
              </Box>
            )}
          </>
        )
      case Media.Image:
        return (
          <>
            {url && shouldPlay && (
              <Box
                position={'absolute'}
                left={'50%'}
                top={'50%'}
                width={'100%'}
                height={'100%'}
                zIndex={100}
                sx={{
                  transform: 'translate(-50% , -50%)',
                  cursor: 'pointer',
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  // setPlay(true);
                }}
                className={'media-content'}
              >
                <NftImage
                  alt={'image'}
                  onError={(e: any) => {
                    e?.target?.style?.setItem('opacity', '0.3')
                    e?.target?.setItem('alt', 'image loaded failed')
                  }}
                  src={getIPFSString(url, baseURL)}
                />
              </Box>
            )}
          </>
        )
      default:
        return <></>
    }
  }, [mediaTyp, url, play, theme.unit])
  React.useEffect(() => {
    if (isShow === false) {
      if (vidRef.current) {
        vidRef.current.pause()
      }
      if (aidRef.current) {
        aidRef.current.pause()
      }
      if (d3Ref.current) {
        d3Ref.current.pause()
      }
    }
    return () => {
      if (vidRef.current) {
        vidRef.current.pause()
      }
      if (aidRef.current) {
        aidRef.current.pause()
      }
      if (d3Ref.current) {
        d3Ref.current.pause()
      }
    }
  }, [isShow])
  return <>{typeSvg}</>
}

export const IPFSSourceUpload = ({
  value,
  onChange,
  width,
  height,
  fullSize = false,
  title = 'labelLoadDes',
  buttonText = 'labelUpload',
  typographyProps,
  buttonProps,
  disabled,
  maxSize = 10485760,
  onDelete,
  types = TYPES,
  getIPFSString,
  messageTypes,
  baseURL,
  ...options
}: Omit<DropzoneOptions, 'onDrop' | 'onDropAccepted'> & {
  // sx?: SxProps<Theme>;
  fullSize?: boolean
  width?: number | string
  messageTypes?: string[]
  height?: number | string
  typographyProps?: TypographyProps
  buttonProps?: Omit<ButtonProps, 'onClick'>
  title?: string
  buttonText?: string
  value: IpfsFile | undefined
  types?: string[]
  onDelete: () => void
  onChange: (files: IpfsFile) => void
  getIPFSString: GET_IPFS_STRING
  baseURL: string
}) => {
  const { t } = useTranslation()
  const onDropAccepted = React.useCallback(
    (file: File[]) => {
      onChange({
        file: file[0],
        isProcessing: true,
        error: undefined,
        localSrc: URL.createObjectURL(file[0]),
        isUpdateIPFS: false,
        uniqueId: Date.now().toString() + file[0].lastModified,
      })
    },
    [onChange],
  )
  const { fileRejections, getRootProps, getInputProps, open, isFocused } = useDropzone({
    ...options,
    disabled,
    maxSize,
    accept: types?.length ? types : undefined,
    onDropAccepted,
    noClick: true,
    noKeyboard: true,
  })

  const isFileTooLarge =
    maxSize !== undefined && fileRejections.length > 0 && fileRejections[0].file.size > maxSize
  const close = React.useMemo(
    () => (
      <IconButton
        size={'medium'}
        aria-label={t('labelClose')}
        sx={{
          position: 'absolute',
          right: 8,
          top: 8,
          background: 'var(--color-global-bg)',
          zIndex: 101,
        }}
        color={'inherit'}
        onClick={onDelete}
      >
        <CloseIcon />
      </IconButton>
    ),
    [onDelete, t],
  )
  return (
    <Box display={'flex'} flexDirection={'column'}>
      <Box
        // display={"flex"}
        overflow={'hidden'}
        position={'relative'}
        style={{
          paddingBottom: height ?? '100%',
          width: width ?? '100%',
        }}
      >
        <ImageIcon
          // fontSize={"large"}
          style={{
            position: 'absolute',
            opacity: 1,
            height: 48,
            width: 48,
            top: '50%',
            left: '50%',
            transform: 'translateY(-50%) translateX(-50%)',
            zIndex: 60,
          }}
        />

        <Box
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            left: 0,
            bottom: 0,
            height: '100%',
            width: '100%',
            zIndex: 99,
          }}
        >
          {value ? (
            value.isProcessing ? (
              <Box
                flex={1}
                display={'flex'}
                alignItems={'center'}
                height={'100%'}
                justifyContent={'center'}
              >
                <img
                  className='loading-gif'
                  width='36'
                  alt={'loading'}
                  src={`${SoursURL}images/loading-line.gif`}
                />
                {close}
              </Box>
            ) : value.error ? (
              <Box
                flex={1}
                display={'flex'}
                alignItems={'center'}
                height={'100%'}
                justifyContent={'center'}
              >
                <ErrorIcon style={{ height: 60, width: 60 }} color={'error'} />
                <Typography variant={'body1'} component={'span'}>
                  {t(value.error.message)}
                </Typography>
                {close}
              </Box>
            ) : (
              <>
                <LinkStyle
                  alignSelf={'stretch'}
                  flex={1}
                  display={'flex'}
                  style={{ background: 'var(--color-box-secondary)' }}
                  height={'100%'}
                  target='_blank'
                  rel='noopener noreferrer'
                  href={value.fullSrc}
                >
                  {value && value.fullSrc ? (
                    <MediaSVGToggle
                      url={value.fullSrc ?? ''}
                      play={true}
                      shouldPlay={true}
                      setPlay={() => {}}
                      mediaTyp={getMediaType(value.file?.type)}
                      getIPFSString={getIPFSString}
                      baseURL={baseURL} //
                      isShow={true}
                    />
                  ) : (
                    <></>
                  )}
                </LinkStyle>

                <Typography
                  component={'span'}
                  display={'flex'}
                  justifyContent={'flex-start'}
                  alignItems={'center'}
                  flexDirection={'column'}
                  sx={{
                    pointerEvents: 'none',
                    opacity: 1,
                    position: 'absolute',
                    right: '0',
                    top: '0',
                    color: 'var(--color-button-text)',
                    zIndex: 100,
                    height: '100%',
                    width: '100%',
                  }}
                >
                  <Typography color={'inherit'} component={'span'} marginTop={1}>
                    Successfully Uploaded
                  </Typography>
                </Typography>
                {close}
              </>
            )
          ) : (
            <BoxStyle
              {...getRootProps()}
              paddingTop={1}
              display={'flex'}
              className={isFocused ? 'focused' : ''}
            >
              <FormControl
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  width: '100%',
                  height: '100%',
                }}
                onClick={open}
                error={isFileTooLarge}
              >
                <input {...getInputProps()} />
                <Typography
                  variant={'h6'}
                  textAlign='center'
                  paddingX={2}
                  paddingBottom={1}
                  {...typographyProps}
                >
                  {t(title, {
                    types: (messageTypes ?? types)
                      ?.reduce((prev, ele) => {
                        const split = ele?.split('/')
                        if (split.length === 2) {
                          return [...prev, split[1]]
                        }
                        return prev
                      }, [] as string[])
                      ?.join(', '),
                    size: (maxSize / 1000000).toFixed(0),
                  })}
                </Typography>
                <FormHelperText>{fileRejections[0]?.errors[0]?.message}</FormHelperText>
              </FormControl>
            </BoxStyle>
          )}
        </Box>
      </Box>
    </Box>
  )
}
//${({ theme }) =>
//  // padding: ${({ theme }) => 2 * theme.unit}px;
//background: ${({ theme }) => hexToRGB(theme.colorBase.textPrimary, ".6")};

const PlayIconStyle = styled(PlayIcon)`
  color: ${({ theme }) => hexToRGB(theme.colorBase.box, '.9')};
  border-radius: 100%;
  box-shadow: inset 0px 0px 60px ${({ theme }) => hexToRGB(theme.colorBase.textPrimary, '.7')};
  padding: ${({ theme }) => 1 * theme.unit}px;
`
