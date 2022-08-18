import * as sdk from "@loopring-web/loopring-sdk";
import React from "react";
import { useSocket, useAccount } from "@loopring-web/core";

import { AccountStatus } from "@loopring-web/common-resources";

const useFiat = () => {
  const { sendSocketTopic, socketEnd } = useSocket();
  const { account } = useAccount();
  React.useEffect(() => {
    if (account.readyState === AccountStatus.ACTIVATED) {
      sendSocketTopic({ [sdk.WsTopicType.account]: true });
    } else {
      socketEnd();
    }
    return () => {
      socketEnd();
    };
  }, [account.readyState]);
};
