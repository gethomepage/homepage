export default function Tooltip({ active, payload, formatter }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-theme-800/80 rounded-md text-theme-200 px-2 py-0">
        {payload.map((pld, id) => (
          <div key={Math.random()} className="first-of-type:pt-0 pt-0.5">
            <div>
              {formatter(pld.value)} {payload[id].name}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
