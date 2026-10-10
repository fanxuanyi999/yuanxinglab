export function Brand({ onHome }: { onHome?: () => void }) {
  return (
    <button className="brand" onClick={onHome} aria-label="人生原型实验室，返回首页">
      <span className="brand-mark">原</span>
      <span>
        <b>人生原型实验室</b>
        <small>ARCHETYPE LAB</small>
      </span>
    </button>
  );
}
