import { Listbox } from "@headlessui/react";
import Stack from "../Stack";
import TextBlock from "../TextBlock";
import "./Picker.css";
import { cx } from "classix";

type Option<T> = {
  label: string;
  value: T;
};

type Props<T> = {
  label?: string;
  value: Option<T>;
  options: Option<T>[];
  onChange: (val: T) => void;
};

export default function Picker<T>({ label, value, options, onChange }: Props<T>) {
  return (
    <Stack className="picker" inline gap="0.25rem">
      <TextBlock>{label}</TextBlock>
      <Stack className="controls">
        <Listbox onChange={onChange} by="value">
          <Listbox.Button className="trigger">{value.label}</Listbox.Button>
          <Listbox.Options className="list">
            {options.map((o, i) => (
              <Listbox.Option key={`${i}-${o.value}`} value={o.value}>
                {({ active, selected }) => (
                  <li className={cx("item", active && "is-active", selected && "is-selected")}>{o.label}</li>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </Listbox>
      </Stack>
    </Stack>
  );
}
