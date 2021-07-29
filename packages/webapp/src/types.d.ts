import { LoopringSocket } from './services/socketUtil';

declare global {
    interface Window {
        loopringSocket:InstanceType<LoopringSocket> ,
        // socketEventMap: {[key:string]:any
        // imageConfig:{[key:string]:any}|undefined
    }
}