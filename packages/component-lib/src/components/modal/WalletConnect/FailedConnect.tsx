import { AlertIcon } from '@loopring-web/common-resources';
import { Button } from '../../basic-lib';

export const FailedConnect = ({handleRetry}: { handleRetry:(event:any)=>void })=>{
    return    <>
        <AlertIcon />
        <Button onClick={handleRetry}></Button></>

}
