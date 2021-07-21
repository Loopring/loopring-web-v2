declare global {
    interface Window {
        loopringSocket:WebSocket
        socketEventMap: {[key:string]:any}
        // imageConfig:{[key:string]:any}|undefined
    }
}