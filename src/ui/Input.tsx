import { ChangeEventHandler, MouseEventHandler } from "react";
import "./Input.css";
import TextBlock from "./TextBlock";

type Props = {
  label: string;
  value: number;
  onChange: ChangeEventHandler<HTMLInputElement>;
};

const Input = ({ label, value, onChange }: Props) => {
  const handleInputWheel: MouseEventHandler = (e) => {
    if (document.activeElement === e.target) {
      e.stopPropagation();
    }
  };
  return (
    <>
      <TextBlock as="label" htmlFor="target_i">
        {label}
      </TextBlock>
      <input
        id="target_i"
        data-unit="dB"
        className="input"
        type="number"
        value={value}
        onChange={onChange}
        onWheel={handleInputWheel}
      />
    </>
  );
};

export default Input;
