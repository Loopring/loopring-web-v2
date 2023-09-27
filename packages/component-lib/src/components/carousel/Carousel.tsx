import styled from '@emotion/styled'
import { Box, BoxProps } from '@mui/material'
import { CarouselItem } from './Interface'
import { myLog, SoursURL } from '@loopring-web/common-resources'
import React from 'react'

const StyleBox = styled(Box)<BoxProps & { imageList: CarouselItem[], preStr: string }>`
  &.carousel {
    //margin-left: 15%;
    //margin-right: 15%;

    ul.slides {
      display: block;
      position: relative;
      margin: 0;
      padding: 0;
      overflow: hidden;
      list-style: none;

      input {
        display: none;
      }

      ${({ imageList }) => `
         height: calc(${imageList[0]?.height ?? 880 / 2}px + 60px);
         width: calc(${imageList[0]?.width ?? 630 / 2}px);
      `}
    }
  }

  .slides * {
    user-select: none;
    -webkit-touch-callout: none;
  }

  .slide-container {
    display: none;
    position: absolute;
  }

  .slide-image {
    display: block;
    position: absolute;
    top: 0;
    opacity: 0;
    transition: all 0.7s ease-in-out;
  }

  .carousel-controls {
    position: absolute;
    top: 0; //50%;
    left: 0;
    right: 0;
    z-index: 999;
    font-size: ${({ theme }) => theme.fontDefault.body1};
    color: var(--color-text-primary);
    height: 100%;
    //transform: translateY(-50%);
    label {
      display: none;
      position: absolute;
      padding: 0 ${({ theme }) => 2 * theme.unit}px;
      opacity: 0;
      transition: opacity 0.2s;
      cursor: pointer;
      font-size: var(--svg-size-huge);
      height: 100%;
      align-items: center;
      justify-content: center;

      &:nth-child(1) {
        justify-content: left;
      }

      &:nth-child(2) {
        justify-content: right;
      }

      &:hover {
        opacity: 1;
      }
    }

    .prev-slide {
      width: 30%;
      text-align: left;
      left: 0;
    }

    .next-slide {
        width: 30%;
        text-align: right;
        right: 0;
      }
    }

    .slide-image:hover + .carousel-controls label {
      opacity: 0.5;
    }

    .carousel-dots {
      position: absolute;
      left: 0;
      right: 0;
      bottom: ${({ theme }) => 2 * theme.unit}px;
      z-index: 999;
      text-align: center;
    }

  .carousel-dots .carousel-dot {
    display: inline-block;
    width: var(--carousel-dot-size);
    height: var(--carousel-dot-size);
    border-radius: 50%;
    background-color: #fff;
    opacity: 0.5;
    margin: 10px;
  }

  input:checked + .slide-container {
    display: block;
  }

  input:checked + .slide-container .slide-image {
    opacity: 1;
    transform: scale(1);
    transition: opacity 1s ease-in-out;
  }

  input:checked + .slide-container .carousel-controls label {
    //display: block;
    display: inline-flex;
  }

  ${({imageList, preStr}) => {
    let label: string = imageList.reduce((prev, _, index) => {
      prev += `input#${preStr}${index + 1}:checked ~ .carousel-dots label#${preStr}dot-${index + 1},`
      return prev
    }, '' as string)
    label += `{ opacity: 1;}`
    return label
  }}
  input:checked + .slide-container .nav label {
    display: block;
  }
}
` as (props: BoxProps & { imageList: CarouselItem[], preStr: string }) => JSX.Element

export const Carousel = ({
                           loading,
                           imageList,
                           preStr = 'img-',
                           selected,
                           handleSelected
                         }: {
  loading: boolean
  imageList: CarouselItem[]
  selected: number
  preStr?: string,
  handleSelected: (id: number) => void
}) => {
  myLog('imageList', imageList)
  return (
    <Box>
      {loading ? (
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
        <StyleBox preStr={preStr} className='carousel' imageList={imageList}>
          <Box component={'ul'} className='slides'>
            {imageList.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <input type='radio'
                         name='radio-buttons'
                         id={`${preStr}${index + 1}`} checked={selected == index}/>
                  <Box
                    component={'li'}
                    className='slide-container'
                    sx={{
                      height: item?.size[ 1 ],
                      width: item?.size[ 0 ],
                    }}
                  >
                    <Box className='slide-image'>
                      <img
                        src={item.imageUrl}
                        alt={'image'}
                        style={{
                          height: item?.size[1],
                          width: item?.size[0],
                        }}
                      />
                    </Box>
                    <Box className='carousel-controls'>
                      <label
                        onClick={
                          () => {
                            handleSelected(selected === 0 ? imageList.length - 1 : selected - 1)
                          }
                        }
                        className='prev-slide'
                      >
                        <span>&lsaquo;</span>
                      </label>

                      <label
                        onClick={
                          () => {
                            handleSelected(selected === imageList.length - 1 ? 0 : selected + 1)
                          }
                        }
                        className='next-slide'
                      >
                        <span>&rsaquo;</span>
                      </label>
                    </Box>
                  </Box>
                </React.Fragment>
              )
            })}

            <Box className='carousel-dots'>
              {imageList.map((_, index) => {
                return (
                  <label
                    key={index}
                    onClick={
                      () => {
                        handleSelected(index)
                      }
                    }
                    className='carousel-dot'
                    id={`${preStr}dot-${index + 1}`}
                  />
                )
              })}
            </Box>
          </Box>
        </StyleBox>
      )}
    </Box>
  )
}
