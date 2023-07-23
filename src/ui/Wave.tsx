import cx from "classix";
import { useEffect, useRef } from "react";
import WaveSurfer from "wavesurfer.js";
import "./Wave.css";

type Props = {
  src: string;
};

export default function Wave({ src }: Props) {
  const wavesurferRef = useRef<WaveSurfer>();
  const visualizerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wavesurferRef.current) {
      wavesurferRef.current = WaveSurfer.create({
        container: visualizerRef.current!,
        waveColor: "hsl(214, 40%, 40%)",
        progressColor: "hsl(214, 30%, 60%)",
      });
      wavesurferRef.current.on(
        "interaction",
        () => wavesurferRef.current?.play
      );
    }

    const loadUrl = async (url: string) => {
      await wavesurferRef.current?.load(url);
    };
    if (src) {
      loadUrl(src);
    }
  }, [wavesurferRef, src]);

  return (
    <div
      className={cx("wavesurfer", src !== "" && "has-audio")}
      ref={visualizerRef}
    />
  );
}
