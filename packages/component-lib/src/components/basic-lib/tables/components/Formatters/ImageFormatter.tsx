import styled from '@emotion/styled'

const WrapperClassname = styled.div`
  display: flex;
  justify-content: space-around;
`

const ImageCellClassname = styled.div`
  background: #efefef;
  background-size: 100%;
  display: inline-block;
  height: 28px;
  width: 28px;
  vertical-align: middle;
  background-position: center;
`

interface Props {
  /** image url, used as background-image */
  value: string
}

export function ImageFormatter({ value }: Props) {
  return (
    <WrapperClassname>
      <ImageCellClassname style={{ backgroundImage: `url(${value})` }} />
    </WrapperClassname>
  )
}
