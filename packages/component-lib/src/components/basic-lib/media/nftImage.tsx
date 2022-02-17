import { NftImageProps } from "./Interface";

export const NftImage = (props: NftImageProps) => {
  return (
    <img
      contentEditable={true}
      referrerPolicy={"unsafe-url"}
      loading={"lazy"}
      crossOrigin={"anonymous"}
      onError={props.onError}
      alt={props.name ?? "NFT"}
      width={props.width ?? "100%"}
      height={props.height ?? "100%"}
      src={props.src}
    />
  );
};
