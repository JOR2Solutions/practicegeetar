import { jsxDEV } from "react/jsx-dev-runtime";
import React from "react";
import { createRoot } from "react-dom/client";
import { Player } from "@websim/remotion/player";
import { SlideshowComposition } from "./composition.jsx";
import { remotionOverlay, remotionPlayerContainer, remotionCloseButton } from "./dom.js";
let root = null;
function closeExporter() {
  remotionOverlay.style.display = "none";
  if (root) {
    root.unmount();
    root = null;
  }
  remotionPlayerContainer.innerHTML = "";
}
function renderGifExporter(props) {
  if (!root) {
    root = createRoot(remotionPlayerContainer);
    remotionCloseButton.addEventListener("click", closeExporter);
    remotionOverlay.addEventListener("click", (e) => {
      if (e.target === remotionOverlay) {
        closeExporter();
      }
    });
  }
  const durationInFrames = props.slides.length * props.duration * 30;
  remotionOverlay.style.display = "flex";
  root.render(
    /* @__PURE__ */ jsxDEV(
      Player,
      {
        component: SlideshowComposition,
        durationInFrames,
        fps: 30,
        compositionWidth: 1080,
        compositionHeight: 600,
        controls: true,
        inputProps: props,
        loop: true,
        style: {
          maxWidth: "100%",
          maxHeight: "100%",
          width: "auto",
          height: "calc(90vh - 100px)",
          // Adjust based on modal padding/titles
          aspectRatio: "1080 / 600"
        },
        showExportButton: true
      },
      void 0,
      false,
      {
        fileName: "<stdin>",
        lineNumber: 33,
        columnNumber: 9
      },
      this
    )
  );
}
export {
  renderGifExporter
};
