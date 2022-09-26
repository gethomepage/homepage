import { MdRefresh } from "react-icons/md";

export default function Revalidate() {
  const revalidate = () => {
    fetch("/api/revalidate").then((res) => {
      if (res.ok) {
        window.location.reload();
      }
    });
  };

  return (
    <div className="rounded-full flex align-middle self-center mr-3">
      <MdRefresh onClick={() => revalidate()} className="text-theme-800 dark:text-theme-200 w-6 h-6 cursor-pointer" />
    </div>
  );
}
