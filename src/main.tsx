import { FFmpeg } from "@ffmpeg/ffmpeg";
import { toBlobURL } from "@ffmpeg/util";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const baseUrl = "https://unpkg.com/@ffmpeg/core@0.12.1/dist/umd";

const testFfmpeg = async () => {
  const ffmpeg = new FFmpeg();
  console.log(ffmpeg);
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseUrl}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseUrl}/ffmpeg-core.wasm`, "application/wasm"),
  });
  console.log("loaded");
  console.log(ffmpeg);
};
testFfmpeg();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
