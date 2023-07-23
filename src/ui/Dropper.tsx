import { UploadOutlined } from "@ant-design/icons";
import { UploadProps } from "antd";
import Dragger from "antd/es/upload/Dragger";
import "./Dropper.css";

type Props = {
  onDrop: (files: FileList) => void;
};

export default function Dropper({ onDrop }: Props) {
  const uploadProps: UploadProps = {
    name: "file",
    multiple: false,
    accept: "audio/wav",
    showUploadList: false,
    customRequest: async ({ onSuccess }) => {
      onSuccess?.("ok");
    },
    async onDrop(e) {
      onDrop(e.dataTransfer.files);
    },
  };

  return (
    <Dragger {...uploadProps} className="dropper">
      <UploadOutlined />
      <p>Drop .wav here</p>
    </Dragger>
  );
}
