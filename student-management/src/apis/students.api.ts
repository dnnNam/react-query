// sẽ khai các lần gọi api trong này

import { Students } from 'types/students.type'
import http from 'utils/http'

// truyền page và limit hỗ trợ pagination
export const getStudents = (page: number | string, limit: number | string) =>
  // cái getStudents này return về cái kiểu axios
  // axios return về data có kiểu Students
  http.get<Students>('students', {
    params: {
      _page: page,
      _limit: limit
    }
  })
