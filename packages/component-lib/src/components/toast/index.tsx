import { Snackbar, Alert, } from '@material-ui/core'
import { useCallback } from 'react'

export interface ToastProps {
    open: boolean
    severity?: 'success' | 'error' | 'warning' | 'info'
    alertText: string
    autoHideDuration?: number
    setOpen: (open: boolean) => void
}

export const Toast = ({ open, setOpen, severity, alertText, autoHideDuration }: ToastProps) => {
    
    if (severity === undefined) {
        severity = 'success'
    }

    if (autoHideDuration === undefined) {
        autoHideDuration = 2000
    }

    const onClose = useCallback(() => {
        setOpen(false)
    }, [setOpen])

    return (
        <Snackbar open={open} autoHideDuration={autoHideDuration} onClose={onClose}>
            <Alert onClose={onClose} severity={severity}>
                {alertText}
            </Alert>
        </Snackbar>
    )
}
