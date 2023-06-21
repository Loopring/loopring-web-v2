import { CreateAccountBase, IconType, PanelProps } from "./BasicPanel";

// symbol
export const CreateAccount_Approve_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelTokenAccess", { symbol: props.symbol }),
  };
  return <CreateAccountBase {...props} {...propsPatch} />;
};

// symbol
export const CreateAccount_Approve_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelFailedTokenAccess", { symbol: props.symbol }),
  };
  return <CreateAccountBase {...propsPatch} {...props} />;
};

// symbol
export const CreateAccount_Approve_Submit = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelSuccessTokenAccess", { symbol: props.symbol }),
  };
  return <CreateAccountBase {...propsPatch} {...props} />;
};

// value symbol
export const CreateAccount_WaitForAuth = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.LoadingIcon,
    describe1: props.t("labelL1toL2WaitForAuth", {
      symbol: props.symbol,
      loopringL2: "Loopring L2",
    }),
  };
  return <CreateAccountBase {...propsPatch} {...props} />;
};

// value symbol
export const CreateAccount_Denied = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.RefuseIcon,
    describe1: props.t("labelCreateAccountDepositDenied", {
      symbol: props.symbol,
    }),
  };
  return <CreateAccountBase {...propsPatch} {...props} />;
};

// value symbol
export const CreateAccount_Failed = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.FailedIcon,
    describe1: props.t("labelCreateAccountFailed", {
      loopringL2: "Loopring L2",
      value: props.value,
      symbol: props.symbol,
    }),
  };
  return <CreateAccountBase {...propsPatch} {...props} />;
};

// value symbol
export const CreateAccount_Submit = (props: PanelProps) => {
  const propsPatch = {
    iconType: IconType.SubmitIcon,
    describe1: props.t("labelCreateAccountSubmit", {
      loopringL2: "Loopring L2",
      value: props.value,
      symbol: props.symbol,
      count: 30,
    }),
  };
  return <CreateAccountBase {...propsPatch} {...props} />;
};
