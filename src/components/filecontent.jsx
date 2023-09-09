import useSWR from "swr"

export default function FileContent({ path, loadingValue, errorValue, emptyValue = '', refresh = 1500 }) {
  const fetcher = (url) => fetch(url).then((res) => res.text())
  const { data, error, isLoading } = useSWR(`/api/config/${ path }`, fetcher, {
    refreshInterval: refresh,
  })

  if (error) return (errorValue)
  if (isLoading) return (loadingValue)
  return (data || emptyValue)
}
