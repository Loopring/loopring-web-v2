import styled from '@emotion/styled'
import { Button, } from '@material-ui/core'

export interface PopperProps {
  isShow: boolean
  title?: string
  content?: string
  btnTxt?: string
  clickToConfirm? : () => void
}

const StyledDiv = styled.div<PopperProps>`
height: 80px;
width: 100%;
background: #393F64;
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

export const BottomRule = ({ isShow, title, content, btnTxt, clickToConfirm, }: PopperProps) => {

  if (!title) {
    title = ''
  }

  if (!content) {
    content = ''
  }

  if (!btnTxt) {
    btnTxt = 'Agree'
  }
  
  return (
    <StyledDiv isShow={isShow}>
      { title && <div className={'title'}>{title}</div> }
      { content && <div className={'content'}>{content}</div> }
      <Button onClick={() => { if (clickToConfirm) {
        clickToConfirm()
      }}} > {btnTxt} </Button>
    </StyledDiv>
  )

}
