import { myLog } from './log_tools'

export async function copyToClipBoard(text: string) {
  //复制到剪切板

  if (document.execCommand) {
    var textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.value = text
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }

  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text)
  }

  if ((window as any).clipboardData) {
    ;(window as any).clipboardData.setData('Text', text)

    myLog('clipboardData:', text)
    return true
  }
  return false
}
