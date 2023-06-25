import { Subject } from "rxjs";
import { create, IPFSHTTPClient } from "ipfs-http-client";

import {
  CustomError,
  ErrorMap,
  IPFS_LOOPRING_URL,
  UIERROR_CODE,
} from "@loopring-web/common-resources";
import * as sdk from "@loopring-web/loopring-sdk";

export enum IPFSCommands {
  ErrorGetIpfs = "ErrorGetIpfs",
  IpfsResult = "IpfsResult",
}
export class IpfsProvides {
  private _ipfs: IPFSHTTPClient | undefined = undefined;

  get ipfs(): IPFSHTTPClient | undefined {
    return this._ipfs;
  }

  async init() {
    try {
      this._ipfs = await create({
        url: `${IPFS_LOOPRING_URL}`,
      });
    } catch (error) {
      console.error("IPFSHTTPClient ERROR ON INIT::", error);
      ipfsService.sendError(new CustomError(ErrorMap.CREATE_IPFS_ERROR));
    }
    return this._ipfs;
  }

  stop() {
    if (this._ipfs) {
      try {
        this._ipfs = undefined;
      } catch (err) {
        console.error("IPFSHTTPClient ERROR ON STOP::", err as any);
      }
    }
  }
}

const subject = new Subject<{
  status: IPFSCommands;
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
          status: IPFSCommands.ErrorGetIpfs,
          data: {
            uniqueId,
            error: {
              code: UIERROR_CODE.ADD_IPFS_ERROR,
              ...(error as any),
              uniqueId,
            },
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
          } as sdk.RESULT_INFO,
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
        const data = await ipfs.add({ content: file.stream() }).catch((e) => {
          throw e;
        });
        subject.next({
          status: IPFSCommands.IpfsResult,
          data: { ...data, uniqueId, file },
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
  addJSON: async ({
    ipfs,
    json,
    uniqueId,
  }: {
    ipfs: IPFSHTTPClient | undefined;
    json: string;
    uniqueId: string;
  }) => {
    if (ipfs) {
      try {
        const data = await ipfs.add(json); //callIpfs({ ipfs, cmd, opts });
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
