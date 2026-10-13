export function Brand({ onHome }: { onHome?: () => void }) {
  const logo = <b>人生原型实验室</b>;
  if (!onHome) return <span className="brand">{logo}</span>;
  return (
    <button className="brand" onClick={onHome} aria-label="人生原型实验室，返回首页">
      {logo}
    </button>
  );
}
