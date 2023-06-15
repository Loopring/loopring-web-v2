import React from "react";
import {
  ShareReferralSvg,
  ShareReferralSvgProps,
} from "@loopring-web/common-resources";

export const ReferralImage = ({
  src,
  width,
  height,
  ...props
}: ShareReferralSvgProps) => {
  const ref = React.createRef<SVGSVGElement>();

  const makeImage = () => {
    try {
      let name: any = src ?? "/".split("/");
      name = name[name.length() - 1];
      // @ts-ignore-start
      const svg: SVGElement = ref.current as SVGElement;
      const w = Number(svg.getAttribute("width") ?? width);
      const h = Number(svg.getAttribute("height") ?? height);
      if (svg && svg.outerHTML) {
        const canvas = document.createElement("canvas");
        const base64doc = btoa(unescape(encodeURIComponent(svg.outerHTML)));
        const img_to_download = document.createElement("img");
        img_to_download.src = "data:image/svg+xml;base64," + base64doc;
        img_to_download.onload = function () {
          canvas.setAttribute("width", w.toString());
          canvas.setAttribute("height", h.toString());
          // @ts-ignore
          const context: CanvasRenderingContext2D = canvas.getContext("2d");
          context.drawImage(img_to_download, 0, 0, w, h);
          const dataURL = canvas.toDataURL("image/png");
          // @ts-ignore
          if (window.navigator.msSaveBlob) {
            // @ts-ignore
            window.navigator.msSaveBlob(
              // @ts-ignore
              canvas.msToBlob(),
              name
            );
            // e.preventDefault();
          } else {
            const a = document.createElement("a");
            const my_evt = new MouseEvent("click");
            a.download = "Loopring_Red_Packet.png";
            a.href = dataURL;
            a.dispatchEvent(my_evt);
          }
          //canvas.parentNode.removeChild(canvas);
        };
      }
      // @ts-ignore-end
    } catch (error) {}
  };

  React.useEffect(() => {
    makeImage();
  }, [ref.current]);

  return (
    <ShareReferralSvg
      ref={ref}
      src={src}
      width={width}
      height={height}
      {...{ ...props }}
    />
  );
};
