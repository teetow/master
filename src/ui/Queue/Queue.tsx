import cx from "classix";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { Job } from "../../lib/types";
import Icons from "../../components/Icons";
import Stack from "../Stack";
import Item from "./Item";
import "./Queue.css";

type Props = {
  queue: Job[];
  onDrop: (files: FileList) => void;
};

export default function Queue({ queue, onDrop }: Props) {
  const dragCtr = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleEnter = (e: DragEvent) => {
    dragCtr.current += 1;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleOver = (e: DragEvent) => {
    console.log(dragCtr.current);
    e.stopPropagation();
    e.preventDefault();
  };

  const handleOut = () => {
    dragCtr.current -= 1;
    if (dragCtr.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLElement>) => {
    e.preventDefault();
    onDrop?.(e.dataTransfer.files);
    dragCtr.current = 0;
    setIsDragging(false);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      onDrop?.(e.target.files);
    }
  };

  return (
    <>
      <Stack
        as="ul"
        className={cx("queue", isDragging && "has-drop")}
        gap="1rem"
        alignContent="start"
        onDragEnter={handleEnter}
        onDragOver={handleOver}
        onDragLeaveCapture={handleOut}
        onDrop={handleDrop}
      >
        {queue.length === 0 || isDragging ? (
          <div className="placeholder">
            <Icons.Download />
            <span className="droptext">Drop audio here</span>
            <span>or</span>
            <input className="dropbutton" type="file" onChange={handleFileSelect} accept="audio/*" />
          </div>
        ) : (
          <></>
        )}
        {[...queue].reverse().map((item, index) => (
          <Item key={`${index}-${item.src?.name}`} {...item} />
        ))}
      </Stack>
    </>
  );
}
