import { Subject } from "rxjs";
import { create, IPFS } from "ipfs-core";
import { IPFSCommands } from "../account/command";
import { ErrorCode } from "react-dropzone";
import { UIERROR_CODE } from "@loopring-web/common-resources";

export class IpfsProvides {
  get ipfs(): IPFS | undefined {
    return this._ipfs;
  }
  private _ipfs: IPFS | undefined = undefined;
  constructor() {
    try {
      create().then((ipfs) => {
        this._ipfs = ipfs;
      });
    } catch (error) {
      console.error("IPFS ERROR ON INIT:", error);
      this._ipfs = undefined;
      // setIpfsInitError(error);
    }
  }
  startIpfs() {
    if (this._ipfs) {
      this._ipfs.start();
    } else {
      console.error("IPFS ERROR ON START:", "No ipfs");
    }
  }
  stop() {
    if (this._ipfs) {
      this._ipfs
        .stop()
        .catch((err) => console.error("IPFS ERROR ON STOP:", err));
    }
  }
}
//
// async function callIpfs({
//   ipfs,
//   cmd,
//   opts,
// }: {
//   ipfs: IPFS;
//   cmd: string;
//   opts: object;
//   [key: string]: any;
// }): Promise<any> {
//   if (!ipfs) return null;
//   console.log(`Call ipfs.${cmd}`);
//   const ipfsCmd = prop.get(ipfs, cmd) as (props: any) => Promise<any>;
//   return await ipfsCmd(opts);
// }

const subject = new Subject<{
  status: keyof typeof IPFSCommands;
  data?: {
    uniqueId: string;
    [key: string]: any;
  };
}>();

export const ipfsService = {
  addJSONStringify: async ({
    ipfs,
    str,
    uniqueId,
  }: {
    ipfs: IPFS;
    str: string;
    uniqueId: string;
  }) => {
    if (ipfs) {
      try {
        const data = await ipfs.add(str); //callIpfs({ ipfs, cmd, opts });
        subject.next({
          status: IPFSCommands.IpfsResult,
          data: { ...data, uniqueId },
        });
      } catch (error) {
        subject.next({
          status: IPFSCommands.IpfsResult,
          data: {
            code: UIERROR_CODE.ADD_IPFS_ERROR,
            ...(error as any),
            uniqueId,
          },
        });
      }
    } else {
      subject.next({
        status: IPFSCommands.ErrorGetIpfs,
        data: {
          uniqueId,
          error: {
            code: UIERROR_CODE.NO_IPFS_INSTANCE,
            message: "IPFS is undefined",
          },
        },
      });
    }
  },
  addFile: async ({
    ipfs,
    file,
    uniqueId,
  }: {
    ipfs: IPFS | undefined;
    file: File;
    uniqueId: string;
  }) => {
    if (ipfs) {
      try {
        const data = await ipfs.add(file); //callIpfs({ ipfs, cmd, opts });
        subject.next({
          status: IPFSCommands.IpfsResult,
          data: { ...data, uniqueId },
        });
      } catch (error) {
        subject.next({
          status: IPFSCommands.IpfsResult,
          data: {
            error: {
              code: UIERROR_CODE.ADD_IPFS_ERROR,
              ...(error as any),
            },
            uniqueId,
          },
        });
      }
    } else {
      subject.next({
        status: IPFSCommands.ErrorGetIpfs,
        data: {
          uniqueId,
          error: {
            code: UIERROR_CODE.NO_IPFS_INSTANCE,
            message: "IPFS is undefined",
          },
        },
      });
    }
  },

  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
};
