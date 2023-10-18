import useSWR from "swr";

export default function FileContent({ path, loadingValue, errorValue, emptyValue = "" }) {
  const fetcher = (url) => fetch(url).then((res) => res.text());
  const { data, error, isLoading } = useSWR(`/api/config/${path}`, fetcher);

  if (error) return errorValue;
  if (isLoading) return loadingValue;
  return data || emptyValue;
}
