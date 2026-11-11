export default function Tooltip({ active, payload, formatter }) {
  const entries = payload?.filter((pld) => pld.value != null);

  if (active && entries?.length) {
    return (
      <div className="bg-theme-800/80 rounded-md text-theme-200 px-2 py-0">
        {entries.map((pld, id) => (
          <div key={`${pld.dataKey ?? pld.name ?? "series"}-${id}`} className="first-of-type:pt-0 pt-0.5">
            <div>
              {formatter(pld.value)} {pld.name}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return null;
}
