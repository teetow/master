import { Select } from "antd";
import Stack from "../Stack";
import TextBlock from "../TextBlock";

type Props<T> = {
  label?: string;
  value: T;
  options: {
    label: string;
    value: T;
  }[];
  onChange: (val: T) => void;
};

export default function Picker<T>({ label, value, options, onChange }: Props<T>) {
  return (
    <Stack className="picker" inline gap="0.5em">
      <TextBlock>{label}</TextBlock>
      <Select options={options} defaultValue={value} onChange={onChange} />
    </Stack>
  );
}
