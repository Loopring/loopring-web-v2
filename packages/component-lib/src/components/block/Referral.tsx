import React from "react";
import {
  ShareReferralSvg,
  ShareReferralSvgProps,
} from "@loopring-web/common-resources";

export const ReferralImage = React.forwardRef(
  (
    { src, width, height, ...props }: ShareReferralSvgProps,
    ref: React.ForwardedRef<SVGSVGElement>
  ) => {
    const makeImage = React.useCallback(() => {
      try {
        let name: any = (src ?? "/").split("/");
        name = name[name.length - 1];
        // debugger;
        // @ts-ignore-start
        const svg: SVGElement = ref.current as SVGElement;

        svg.setAttribute("name", name);

        if (svg && svg.outerHTML) {
          const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
          svg.setAttribute(
            "base64doc",
            "data:image/svg+xml;base64," + base64doc
          );
        }
        // @ts-ignore-end
      } catch (error) {}
    }, [ref]);

    const [base64, setBase64] = React.useState("");
    const convertImageToBase64 = (
      imgUrl: string,
      callback: (dataUrl: string) => void
    ) => {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = image.naturalHeight;
        canvas.width = image.naturalWidth;
        // @ts-ignore
        ctx.drawImage(image, 0, 0);
        const dataUrl = canvas.toDataURL();
        callback && callback(dataUrl);
      };
      image.src = imgUrl;
    };
    convertImageToBase64(src, (dataUrl) => {
      setBase64(dataUrl);
      makeImage();
    });

    return (
      <>
        {base64 && (
          <ShareReferralSvg
            ref={ref}
            src={base64}
            width={width}
            height={height}
            {...{ ...props }}
          />
        )}
      </>
    );
  }
) as (props: ShareReferralSvgProps) => JSX.Element;
