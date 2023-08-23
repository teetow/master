import cx from "classix";
import { DragEvent, useRef, useState } from "react";
import { Job } from "../../lib/types";
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
    console.log("enter", e.target);
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
            <img className="dropicon" src="drop.svg" />
            <span className="droptext">Drop audio here</span>
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
