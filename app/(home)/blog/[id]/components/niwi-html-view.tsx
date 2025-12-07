"use client";
import HtmlRenderer from "./html-render/html-render";
import useHtmlTwitterLoader from  "./useHtmlTwitterLoader"
function NiwiHtmlView({ htmlText }: { htmlText: string }) {
  const { containerRef } = useHtmlTwitterLoader({ htmlText });

  return (
    <div className="editor-container" ref={containerRef}>
      <div className="editor-inner">
        <HtmlRenderer  htmlString={htmlText} className="font-charter_regular leading-relaxed editor-input" />
      </div>
    </div>
  );
}
export default NiwiHtmlView;
