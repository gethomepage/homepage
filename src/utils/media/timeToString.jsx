function millisecondsToTime(milliseconds) {
  const seconds = Math.floor((milliseconds / 1000) % 60);
  const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
  const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
  return { hours, minutes, seconds };
}

export default function MillisecondsToString(milliseconds) {
  const { hours, minutes, seconds } = millisecondsToTime(milliseconds);
  let timeVal = "";
  if (hours > 0) {
    timeVal = hours.toString();
    timeVal += ":";
    timeVal += minutes.toString().padStart(2, "0");
  }
  else {
    timeVal += minutes.toString();
  }
  timeVal += ":";
  timeVal += seconds.toString().padStart(2, "0");
  return timeVal;
}
