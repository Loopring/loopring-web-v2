import { Subject } from 'rxjs'
import { Html5QrcodeScanner, Html5QrcodeScanType, Html5QrcodeSupportedFormats } from 'html5-qrcode'

import { CustomError, ErrorMap, QRCODE_REGION_ID } from '@loopring-web/common-resources'

function onScanSuccess(decodedText: any, decodedResult: any) {
  // handle the scanned code as you like, for example:
  // console.log(`Code matched = ${decodedText}`, decodedResult);
  h5QrcodeScannerService.sendSuccess({
    data: {
      decodedText,
      decodedResult,
    },
  })
}

function onScanFailure(error: any) {
  // handle scan failure, usually better to ignore and keep scanning.
  // for example:
  // console.warn(`Code scan error = ${error}`);
  h5QrcodeScannerService.sendError({ ...error })
}

export class Html5QrcodeScannerProvides {
  private _h5QrcodeScanner: Html5QrcodeScanner | undefined = undefined

  get h5QrcodeScanner(): Html5QrcodeScanner | undefined {
    return this._h5QrcodeScanner
  }

  constructor() {
    this.init()
    this.clear()
  }

  async init() {
    try {
      this._h5QrcodeScanner = new Html5QrcodeScanner(
        QRCODE_REGION_ID,
        {
          fps: 10,
          qrbox: { width: 260, height: 260 },
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE],
          supportedScanTypes: [
            // Html5QrcodeScanType.SCAN_TYPE_CAMERA,
            Html5QrcodeScanType.SCAN_TYPE_FILE,
          ],
        },
        true,
      )
    } catch (error) {
      console.error('IPFSHTTPClient ERROR ON INIT::', error)
      h5QrcodeScannerService.sendError(new CustomError(ErrorMap.CREATE_IPFS_ERROR))
    }
    return this._h5QrcodeScanner
  }

  clear() {
    if (this._h5QrcodeScanner) {
      try {
        this._h5QrcodeScanner.clear()
      } catch (err) {
        console.error('IPFSHTTPClient ERROR ON STOP::', err as any)
      }
    }
  }

  stop() {
    if (this._h5QrcodeScanner) {
      try {
        this._h5QrcodeScanner.clear()
        this._h5QrcodeScanner = undefined
      } catch (err) {
        console.error('IPFSHTTPClient ERROR ON STOP::', err as any)
      }
    }
  }

  render() {
    if (this._h5QrcodeScanner) {
      try {
        this._h5QrcodeScanner.render(onScanSuccess, onScanFailure)
        // this._h5QrcodeScanner = undefined;
      } catch (err) {
        // console.error("IPFSHTTPClient ERROR ON STOP::", err as any);
      }
    }
  }
}

export enum H5QrcodeScannerCommands {
  ErrorHtml5QrcodeScanner = 'ErrorHtml5QrcodeScanner',
  SuccessH5QrcodeScanner = 'SuccessH5QrcodeScanner',
}

const subject = new Subject<{
  status: H5QrcodeScannerCommands
  data?: {
    uniqueId?: string
    [key: string]: any
  }
}>()

export const h5QrcodeScannerService = {
  sendError: (error: CustomError) => {
    subject.next({
      status: H5QrcodeScannerCommands.ErrorHtml5QrcodeScanner,
      data: {
        error: error,
      },
    })
  },
  // cleanQRScanner: () => {
  //   h5QrcodeScannerProvides.clear();
  // },
  // renderQRScanner: () => {
  //   h5QrcodeScannerProvides.render();
  // },
  sendSuccess: (data: any) => {
    subject.next({
      status: H5QrcodeScannerCommands.SuccessH5QrcodeScanner,
      data,
    })
  },
  // addJSONStringify: async ({
  //   ipfs,
  //   str,
  //   uniqueId,
  // }: {
  //   ipfs: Html5QrcodeScanner;
  //   str: string;
  //   uniqueId: string;
  // }) => {
  //   if (ipfs) {
  //     try {
  //       const data = await ipfs.add(str); //callIpfs({ ipfs, cmd, opts });
  //       subject.next({
  //         status: IPFSCommands.IpfsResult,
  //         data: { ...data, uniqueId },
  //       });
  //     } catch (error) {
  //       subject.next({
  //         status: IPFSCommands.ErrorGetIpfs,
  //         data: {
  //           uniqueId,
  //           error: {
  //             code: UIERROR_CODE.ADD_IPFS_ERROR,
  //             ...(error as any),
  //             uniqueId,
  //           },
  //         },
  //       });
  //     }
  //   } else {
  //     subject.next({
  //       status: IPFSCommands.ErrorGetIpfs,
  //       data: {
  //         uniqueId,
  //         error: {
  //           code: UIERROR_CODE.NO_IPFS_INSTANCE,
  //           message: "IPFSHTTPClient is undefined",
  //         } as sdk.RESULT_INFO,
  //       },
  //     });
  //   }
  // },
  // addFile: async ({
  //   ipfs,
  //   file,
  //   uniqueId,
  // }: {
  //   ipfs: IPFSHTTPClient | undefined;
  //   file: File;
  //   uniqueId: string;
  // }) => {
  //   if (ipfs) {
  //     try {
  //       const data: AddResult = await ipfs
  //         .add({ content: file.stream() })
  //         .catch((e) => {
  //           throw e;
  //         });
  //       subject.next({
  //         status: IPFSCommands.IpfsResult,
  //         data: { ...data, uniqueId, file },
  //       });
  //     } catch (error) {
  //       subject.next({
  //         status: IPFSCommands.ErrorGetIpfs,
  //         data: {
  //           error: {
  //             code: UIERROR_CODE.ADD_IPFS_ERROR,
  //             ...(error as any),
  //           },
  //           uniqueId,
  //         },
  //       });
  //     }
  //   } else {
  //     subject.next({
  //       status: IPFSCommands.ErrorGetIpfs,
  //       data: {
  //         uniqueId,
  //         error: {
  //           code: UIERROR_CODE.NO_IPFS_INSTANCE,
  //           message: "IPFSHTTPClient is undefined",
  //         },
  //       },
  //     });
  //   }
  // },
  // addJSON: async ({
  //   ipfs,
  //   json,
  //   uniqueId,
  // }: {
  //   ipfs: IPFSHTTPClient | undefined;
  //   json: string;
  //   uniqueId: string;
  // }) => {
  //   if (ipfs) {
  //     try {
  //       const data: AddResult = await ipfs.add(json); //callIpfs({ ipfs, cmd, opts });
  //       subject.next({
  //         status: IPFSCommands.IpfsResult,
  //         data: { ...data, uniqueId },
  //       });
  //     } catch (error) {
  //       subject.next({
  //         status: IPFSCommands.ErrorGetIpfs,
  //         data: {
  //           error: {
  //             code: UIERROR_CODE.ADD_IPFS_ERROR,
  //             ...(error as any),
  //           },
  //           uniqueId,
  //         },
  //       });
  //     }
  //   } else {
  //     subject.next({
  //       status: IPFSCommands.ErrorGetIpfs,
  //       data: {
  //         uniqueId,
  //         error: {
  //           code: UIERROR_CODE.NO_IPFS_INSTANCE,
  //           message: "IPFSHTTPClient is undefined",
  //         },
  //       },
  //     });
  //   }
  // },

  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
}
