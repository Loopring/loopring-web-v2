import { LoopringSocket } from './services/socket/socketUtil';

declare global {
    interface Window {
        loopringSocket: InstanceType<LoopringSocket>,
        __renderReportCall__: ()=>void,
        // socketEventMap: {[key:string]:any
        // imageConfig:{[key:string]:any}|undefined
    }
}
declare module '*.html' {
    const value: string;
    export default value
}