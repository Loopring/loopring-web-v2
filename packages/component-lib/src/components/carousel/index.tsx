import styled from '@emotion/styled'
import { Box } from '@mui/material'
import { SoursURL } from '@loopring-web/common-resources'
import React from 'react'

const StyleBox = styled(Box)`
  .carousel {
    margin-left: 15%;
    margin-right: 15%;
  }

  ul.slides {
    display: block;
    position: relative;
    height: 600px;
    margin: 0;
    padding: 0;
    overflow: hidden;
    list-style: none;
  }

  .slides * {
    user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    -khtml-user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  ul.slides input {
    display: none;
  }

  .slide-container {
    display: block;
  }

  .slide-image {
    display: block;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    opacity: 0;
    transition: all 0.7s ease-in-out;
  }

  .slide-image img {
    width: auto;
    min-width: 100%;
    height: 100%;
  }

  .carousel-controls {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 999;
    font-size: 100px;
    line-height: 600px;
    color: #fff;
  }

  .carousel-controls label {
    display: none;
    position: absolute;
    padding: 0 20px;
    opacity: 0;
    transition: opacity 0.2s;
    cursor: pointer;
  }

  .slide-image:hover + .carousel-controls label {
    opacity: 0.5;
  }

  .carousel-controls label:hover {
    opacity: 1;
  }

  .carousel-controls .prev-slide {
    width: 49%;
    text-align: left;
    left: 0;
  }

  .carousel-controls .next-slide {
    width: 49%;
    text-align: right;
    right: 0;
  }

  .carousel-dots {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 20px;
    z-index: 999;
    text-align: center;
  }

  .carousel-dots .carousel-dot {
    display: inline-block;
    width: 30px;
    height: 30px;
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

  input#img-1:checked ~ .carousel-dots label#img-dot-1,
  input#img-2:checked ~ .carousel-dots label#img-dot-2,
  input#img-3:checked ~ .carousel-dots label#img-dot-3,
  input#img-4:checked ~ .carousel-dots label#img-dot-4,
  input#img-5:checked ~ .carousel-dots label#img-dot-5,
  input#img-6:checked ~ .carousel-dots label#img-dot-6 {
    opacity: 1;
  }

  input:checked + .slide-container .nav label {
    display: block;
  }
`

export const Carousel = ({
  loading,
  imageList,
}: {
  loading: boolean
  imageList: { imageUrl: string }[]
}) => {
  return (
    <StyleBox>
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
        <Box className='carousel'>
          <Box component={'ul'} className='slides'>
            {imageList.map((item, index) => {
              return (
                <React.Fragment key={index}>
                  <input type='radio' name='radio-buttons' id={`img-${index + 1}`} checked />
                  <Box component={'li'} className='slide-container'>
                    <Box className='slide-image'>
                      <img src={item.imageUrl} />
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
                    ></label>
                  </React.Fragment>
                )
              })}
            </Box>
          </Box>
        </Box>
      )}
    </StyleBox>
  )
}
