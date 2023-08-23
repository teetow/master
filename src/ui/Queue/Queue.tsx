import cx from "classix";
import { useEffect, useRef, useState } from "react";
import { Job } from "../../lib/types";
import Stack from "../Stack";
import Item from "./Item";
import "./Queue.css";

type Props = {
  queue: Job[];
};

export default function Queue({ queue }: Props) {
  const [isDragging, setIsDragging] = useState(false);
  const dropZone = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (dropZone.current == null) {
      return;
    }

    const dropEl = dropZone.current;

    const handleOver = () => {
      setIsDragging(true);
    };

    dropEl.addEventListener("dragover", handleOver);

    return () => dropEl.removeEventListener("dragover", handleOver);
  }, [dropZone.current]);

  return (
    <>
      <Stack as="ul" className={cx("queue", isDragging && "has-drop")} gap="1rem" ref={dropZone}>
        {queue.length > 0 ? <></> : <>No items here, boss!</>}
        {queue.map((item, index) => (
          <Item key={`${index}-${item.src?.name}`} {...item} />
        ))}
      </Stack>
    </>
  );
}
