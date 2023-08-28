import cx from "classix";
import { ChangeEvent, DragEvent, useRef, useState } from "react";
import Icons from "../../components/Icons";
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

  const isEmpty = queue !== undefined && queue.length === 0;

  const handleEnter = (e: DragEvent) => {
    dragCtr.current += 1;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleOver = (e: DragEvent) => {
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
        gap="var(--theme-space-16)"
        alignContent="start"
        onDragEnter={handleEnter}
        onDragOver={handleOver}
        onDragLeaveCapture={handleOut}
        onDrop={handleDrop}
      >
        {isEmpty || isDragging ? (
          <div className="placeholder">
            <Icons.Download />
            <span className="droptext">Drop audio here</span>
            {isEmpty && (
              <>
                <span>or</span>
                <input className="dropbutton" type="file" onChange={handleFileSelect} accept="audio/*" />
              </>
            )}
          </div>
        ) : (
          <></>
        )}
        {[...queue].reverse().map((item, index) => (
          <Item key={`${index}-${item.src?.name}`} {...item} />
        ))}
        {!isEmpty && (
          <input className="dropbutton" type="file" onChange={handleFileSelect} accept="audio/*" />
        )}
      </Stack>
    </>
  );
}
