import { BsArrowDownCircle, BsArrowUpCircle } from "react-icons/bs";
import useSWR from "swr";

export default function Ping({ service }) {
  const { data, error } = useSWR(`/api/ping?${new URLSearchParams({ping: service.ping}).toString()}`, {
    refreshInterval: 5000
  });

  if (error) {
    return <div className="w-3 h-3 text-xs text-rose-300 dark:text-rose-500" title={data.status}>&darr;</div>;
  }
  
  if (!data) {
    return <div className="w-3 h-3 text-[10px] text-black/20 dark:text-white/40">PING</div>;
  }

  const statusText = `${service.ping}: HTTP status ${data.status}`;
  
  if (data && data.status !== 200) {
    return (
      <div className="w-3 h-3 text-xs text-rose-300 dark:text-rose-500" title={statusText}>
        <BsArrowDownCircle />
      </div>
    );
  }
  
  if (data && data.status === 200) {
    return (
      <div className="w-3 h-3 text-xs text-emerald-300 dark:text-emerald-500" title={statusText}>
        <BsArrowUpCircle />
      </div>
    );
  }

}
