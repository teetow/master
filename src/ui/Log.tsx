import "./Log.css";

export default function Log({ log }: { log: string[] }) {
  return (
    <div className="logger">
      <label>{log[log.length - 1]}</label>
      <ul className="log">
        {[...log]
          .reverse()
          .slice(1)
          .map((line, index) => (
            <li key={`${index}-${line}`}>{line}</li>
          ))}
      </ul>
    </div>
  );
}
