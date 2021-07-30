import styled from '@emotion/styled';
import { Checkbox } from '@material-ui/core';
import { useCallback } from 'react';

export interface PopperProps {
  isShow: boolean
  title?: string
  content?: string
  checkTxt?: string
  clickToConfirm? : () => void
}

const StyledDiv = styled.div<PopperProps>`
height: 100px;
width: 100%;
background: #000000;
position: fixed;
bottom: 0;
left: 0;
z-index: 100;
text-align: center;

display: ${(props: PopperProps) => props.isShow ? 'block' : 'none'};

.title {
  margin-top: 5px;
  font-size: 16px;
}

.content {
  margin-top: 10px;
  font-size: 12px;
}
`

export const BottomRule = ({ isShow, title, content, checkTxt, clickToConfirm, }: PopperProps) => {

  if (!title) {
    title = ''
  }

  if (!content) {
    content = ''
  }

  if (!checkTxt) {
    checkTxt = 'Click to Confirm'
  }

  const onChange = useCallback((event: any) => {
    if (clickToConfirm && event?.target?.checked) {
      clickToConfirm()
    }
  }, [clickToConfirm])
  
  return (
    <StyledDiv isShow={isShow}>
      <div className={'title'}>{title}</div>
      <div className={'content'}>{content}</div>
      <Checkbox onChange={onChange}/>{checkTxt}
    </StyledDiv>
  )

}
