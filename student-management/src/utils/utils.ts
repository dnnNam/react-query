import { useSearchParams } from 'react-router-dom'

export const useQueryString = () => {
  const [searchParams] = useSearchParams()
  const searchParamObject = Object.fromEntries([...searchParams])
  return searchParamObject
}
