export default function Greeting() {
  const hour = new Date().getHours();

  let day = "day";

  if (hour < 12) {
    day = "morning";
  } else if (hour < 17) {
    day = "afternoon";
  } else {
    day = "evening";
  }

  return <div className="self-end grow text-2xl font-thin text-theme-800 dark:text-theme-200">Good {day}</div>;
}
