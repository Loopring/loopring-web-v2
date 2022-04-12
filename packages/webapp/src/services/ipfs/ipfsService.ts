import { Subject } from "rxjs";
import { create, IPFS } from "ipfs-core";
import prop from "dot-prop";
import { Commands, IPFSCommands } from "../account/command";
import { result } from "lodash";

export class IpfsProvides {
  get ipfs(): IPFS | null {
    return this._ipfs;
  }
  private _ipfs: IPFS | null = null;
  constructor() {
    try {
      create().then((ipfs) => {
        this._ipfs = ipfs;
      });
    } catch (error) {
      console.error("IPFS ERROR ON INIT:", error);
      this._ipfs = null;
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
export const ipfsProvides = new IpfsProvides();

async function callIpfs({
  ipfs,
  cmd,
  opts,
}: {
  ipfs: IPFS;
  cmd: string;
  opts: object;
  [key: string]: any;
}): Promise<any> {
  if (!ipfs) return null;
  console.log(`Call ipfs.${cmd}`);
  const ipfsCmd = prop.get(ipfs, cmd) as (props: any) => Promise<any>;
  return await ipfsCmd(opts);
}

const subject = new Subject<{
  status: keyof typeof IPFSCommands;
  data?: any;
}>();

export const ipfsService = {
  sendipfsCmd: async ({ cmd, opts }: { cmd: string; opts: any }) => {
    if (ipfsProvides.ipfs) {
      const data = await callIpfs();
      subject.next({ status: IPFSCommands.IpfsResult, data: data });
    } else {
      subject.next({ status: IPFSCommands.ErrorGetIpfs });
    }
  },

  // clearMessages: () => subject.next(),
  onSocket: () => subject.asObservable(),
};
