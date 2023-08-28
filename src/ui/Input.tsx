import { ChangeEventHandler, MouseEventHandler } from "react";
import "./Input.css";
import Stack from "./Stack";
import TextBlock from "./TextBlock";

type Props = {
  label: string;
  value: number | string;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const Input = ({ label, value, onChange }: Props) => {
  const handleInputWheel: MouseEventHandler = (e) => {
    if (document.activeElement === e.target) {
      e.stopPropagation();
    }
  };
  return (
    <Stack className="input" inline gap="var(--theme-space-4)">
      <TextBlock as="label" htmlFor="target_i">
        {label}
      </TextBlock>
      <input
        id="target_i"
        data-unit="dB"
        className="input-value"
        type="number"
        value={value}
        onChange={onChange}
        onWheel={handleInputWheel}
      />
    </Stack>
  );
};

export default Input;
