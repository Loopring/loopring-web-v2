import styled from '@emotion/styled'
import { Box, BoxProps } from '@mui/material'
import { CarouselItem } from './Interface'
import { myLog, SoursURL } from '@loopring-web/common-resources'
import React from 'react'

const StyleBox = styled(Box)<BoxProps & { imageList: CarouselItem[] }>`
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
         height: calc(${imageList[ 0 ]?.height ?? 880 / 2}px + 60px);
         width: calc(${imageList[ 0 ]?.width ?? 630 / 2}px);
      `}
    }
  }

  .slides * {
    user-select: none;
    -webkit-touch-callout: none;
  }

  .slide-container {
    display: block;
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
      top: 0;
      left: 0;
      right: 0;
      z-index: 999;
      font-size: ${({ theme }) => theme.fontDefault.body1};
      color: var(--color-text-primary);
      label {
        display: none;
        position: absolute;
        padding: 0 ${({ theme }) => 2 * theme.unit}px;
        opacity: 0;
        transition: opacity 0.2s;
        cursor: pointer;

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

    input:checked + .slide-container .slide-image {
      opacity: 1;
      transform: scale(1);
      transition: opacity 1s ease-in-out;
    }

    input:checked + .slide-container .carousel-controls label {
      display: block;
    }

    ${({ imageList }) => {
      let label: string = imageList.reduce((prev, _, index) => {
        prev += `input#img-${index + 1}:checked ~ .carousel-dots label#img-dot-${index + 1},`
        return prev
      }, '' as string)
      label += `{ opacity: 1;}`
      return label
    }}
    //input#img-1:checked ~ .carousel-dots label#img-dot-1,
    //input#img-2:checked ~ .carousel-dots label#img-dot-2,
    //input#img-3:checked ~ .carousel-dots label#img-dot-3,
    //input#img-4:checked ~ .carousel-dots label#img-dot-4,
    //input#img-5:checked ~ .carousel-dots label#img-dot-5,
    //input#img-6:checked ~ .carousel-dots label#img-dot-6 {
    //  opacity: 1;
    //}

    input:checked + .slide-container .nav label {
      display: block;
    }
  }
` as (props: BoxProps & { imageList: CarouselItem[] }) => JSX.Element

export const Carousel = ({
  loading,
  imageList,
}: {
  loading: boolean
  imageList: CarouselItem[]
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
        <StyleBox className='carousel' imageList={imageList}>
          <Box component={'ul'} className='slides'>
            {imageList.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <input type='radio' name='radio-buttons' id={`img-${index + 1}`} checked />
                  <Box
                    component={'li'}
                    className='slide-container'
                    sx={{
                      height: item?.size[1],
                      width: item?.size[0],
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
                        htmlFor={`img-${index == 0 ? imageList.length : index}`}
                        className='prev-slide'
                      >
                        <span>&lsaquo;</span>
                      </label>

                      <label
                        htmlFor={`img-${index + 1 > imageList.length ? 1 : index + 1}`}
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
                  <React.Fragment key={index}>
                    <label
                      htmlFor={`img-${index + 1}`}
                      className='carousel-dot'
                      id={`img-dot-${index + 1}`}
                    />
                  </React.Fragment>
                )
              })}
            </Box>
          </Box>
        </StyleBox>
      )}
    </Box>
  )
}
