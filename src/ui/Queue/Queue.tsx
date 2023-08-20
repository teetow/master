import { Job } from "../../lib/types";
import Stack from "../Stack";
import Item from "./Item";
import "./Queue.css";

type Props = {
  queue: Job[];
};

export default function Queue({ queue }: Props) {
  return (
    <>
      <Stack as="ul" className="queue" gap="2rem">
        {queue.map((item, index) => (
          <Item key={`${index}-${item.src?.name}`} {...item} />
        ))}
      </Stack>
    </>
  );
}
