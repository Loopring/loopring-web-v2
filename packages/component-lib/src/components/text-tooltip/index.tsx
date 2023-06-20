import { Tooltip } from "@mui/material"

type TextTooltipProps = {
  tooltipTitle: string
  text: string
}
const TextTooltip = ({tooltipTitle, text}: TextTooltipProps) => {
  return <Tooltip placement="top" title={tooltipTitle} >
    <span style={{borderBottom: "1px dotted"}}>
      {text}
    </span>
  </Tooltip>
}
export default TextTooltip