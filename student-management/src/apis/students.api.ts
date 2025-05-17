// sẽ khai các lần gọi api trong này

import http from 'utils/http'

// truyền page và limit hỗ trợ pagination
export const getStudents = (page: number | string, limit: number | string) =>
  http.get('students', {
    params: {
      _page: page,
      _limit: limit
    }
  })
