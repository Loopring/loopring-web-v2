import { Snackbar, Alert, } from '@material-ui/core'

export interface ToastProps {
    open: boolean
    severity: 'success' | 'error' | 'warning' | 'info'
    alertText: string
    autoHideDuration?: number
    onClose: () => void
}

export const Toast = ({ open, severity, alertText, autoHideDuration, onClose }: ToastProps) => {
    if (autoHideDuration === undefined) {
        autoHideDuration = 2000
    }
    return (
        <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
            <Alert onClose={onClose} severity={severity}>
                {alertText}
            </Alert>
        </Snackbar>
    )
}
