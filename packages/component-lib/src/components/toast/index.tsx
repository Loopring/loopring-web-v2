import { Snackbar, Alert, AlertTitle, Typography } from '@mui/material'
import { GoodIcon, AlertIcon, ErrorIcon, InfoIcon } from '@loopring-web/common-resources'
import styled from '@emotion/styled'

export interface ToastProps {
    open: boolean
    severity?: 'success' | 'error' | 'warning' | 'info'
    alertText: string
    autoHideDuration?: number
    onClose: () => void
}

const AlertStyled = styled(Alert)`
    svg:first-of-type {
        width: 2rem;
        height: 2rem;
        margin-top: 0.2rem;
    }
`

export const Toast = ({ open, severity = 'success', alertText, autoHideDuration = 2000, onClose }: ToastProps) => {
    
    const renderTitle = severity === 'success' 
        ? 'Successfully'
        : severity === 'warning'
            ? 'Warning'
            : severity === 'error'
                ? 'Failure'
                : 'Prompt'

    const renderIcon = severity === 'success' 
        ? (<GoodIcon htmlColor={'var(--color-success)'} />)
        : severity === 'warning'
            ? (<AlertIcon htmlColor={'var(--color-warning)'} />)
            : severity === 'error'
                ? (<ErrorIcon htmlColor={'var(--color-error)'} />)
                : (<InfoIcon htmlColor={'var(--color-secondary)'} />)

    return (
        <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
            <AlertStyled icon={renderIcon} severity={severity}>
                <AlertTitle>{renderTitle}</AlertTitle>
                <Typography variant={'h6'} color={'var(--color-text-secondary)'}>{alertText}</Typography>
            </AlertStyled>
        </Snackbar>
    )
}
