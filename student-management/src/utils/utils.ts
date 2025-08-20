import axios, { AxiosError } from 'axios'
import { useSearchParams } from 'react-router-dom'

export const useQueryString = () => {
  const [searchParams] = useSearchParams()
  const searchParamObject = Object.fromEntries([...searchParams])
  return searchParamObject
}

// : có nghĩa là nếu return về error thì thằng error sẽ được định nghĩa là Axios Error
// bổ sung generic type để bổ nghĩa cho error.data không còn báo lỗi nữa
export function isAxiosError<T>(error: unknown): error is AxiosError<T> {
  return axios.isAxiosError(error)
}
