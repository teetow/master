import "./Icons.css";

const Icons = {
  Download: () => (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" className="icon fillicon">
      <path d="M 26 4 L 38 4 L 38 28 L 46 28 L 32 42 L 18 28 L 26 28 L 26 4 Z" id="arrow">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="translate"
          from="0 -3"
          to="0 6"
          dur="2.4s"
          repeatCount="indefinite"
        />
        <animate attributeName="opacity" values="0;0.3;1;1;1;0.3;0;0;0" dur="2.4s" repeatCount="indefinite" />
      </path>
      <rect width="56" height="8" x="4" y="48" rx="4" ry="4" id="base"></rect>
    </svg>
  ),
  ChevronUp: () => (
    <svg viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" className="icon lineicon">
      <path d="M 13 9 L 8 4 L 3 9" />
    </svg>
  ),
  ChevronDown: () => (
    <svg viewBox="0 0 16 12" xmlns="http://www.w3.org/2000/svg" className="icon lineicon">
      <path d="M 3 3 L 8 8 L 13 3" />
    </svg>
  ),
};

export default Icons;
