import { Subject } from "rxjs";
import { create, IPFSHTTPClient } from "ipfs-http-client";
import { IPFSCommands } from "../account/command";
import {
  CustomError,
  ErrorMap,
  myLog,
  UIERROR_CODE,
} from "@loopring-web/common-resources";

export class IpfsProvides {
  get ipfs(): IPFSHTTPClient | undefined {
    return this._ipfs;
  }
  private _ipfs: IPFSHTTPClient | undefined = undefined;
  async init() {
    try {
      //https://ipfs.infura.io:5001
      myLog(
        "authorization",
        process.env.REACT_APP_INFURA_PROJECT_ID +
          ":" +
          process.env.REACT_APP_INFURA_PROJECT_SECRET,
        "Basic " +
          btoa(
            process.env.REACT_APP_INFURA_PROJECT_ID +
              ":" +
              process.env.REACT_APP_INFURA_PROJECT_SECRET
          )
      );
      this._ipfs = await create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
          authorization:
            "Basic " +
            btoa(
              process.env.REACT_APP_INFURA_PROJECT_ID +
                ":" +
                process.env.REACT_APP_INFURA_PROJECT_SECRET
            ),
        },
      });
    } catch (error) {
      console.error("IPFSHTTPClient ERROR ON INIT:", error);
      ipfsService.sendError(new CustomError(ErrorMap.CREATE_IPFS_ERROR));
      // setIpfsInitError(error);
    }
    return this._ipfs;
  }

  // startIpfs() {
  //   if (this._ipfs) {
  //     this._ipfs.start();
  //   } else {
  //     console.error("IPFSHTTPClient ERROR ON START:", "No ipfs");
  //   }
  // }
  stop() {
    if (this._ipfs) {
      this._ipfs
        .stop()
        .catch((err) => console.error("IPFSHTTPClient ERROR ON STOP:", err));
    }
  }
}
//
// async function callIpfs({
//   ipfs,
//   cmd,
//   opts,
// }: {
//   ipfs: IPFSHTTPClient;
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
    uniqueId?: string;
    [key: string]: any;
  };
}>();

export const ipfsService = {
  sendError: (error: CustomError) => {
    subject.next({
      status: IPFSCommands.ErrorGetIpfs,
      data: {
        error: error,
      },
    });
  },
  addJSONStringify: async ({
    ipfs,
    str,
    uniqueId,
  }: {
    ipfs: IPFSHTTPClient;
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
            message: "IPFSHTTPClient is undefined",
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
    ipfs: IPFSHTTPClient | undefined;
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
          status: IPFSCommands.ErrorGetIpfs,
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
            message: "IPFSHTTPClient is undefined",
          },
        },
      });
    }
  },

  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
};
