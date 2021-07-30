import QRCode from 'qrcode.react';

export const WalletConnectQRCode = ({url}: { url: string })=>{
    return  <QRCode value={url} size={160} style={{padding: 5, backgroundColor: '#fff'}} aria-label={`link:${url}`}/>
}