// sẽ khai các lần gọi api trong này

import { Student, Students } from 'types/students.type'
import http from 'utils/http'

// truyền page và limit hỗ trợ pagination
export const getStudents = (page: number | string, limit: number | string) =>
  // cái getStudents này return về cái kiểu axios
  // axios return về data có kiểu Students
  http.get<Students>('students', {
    // students là end point là địa chỉ URL của API mà client sẽ gọi đến để lấy dữ liệu
    params: {
      // request parameter
      _page: page,
      _limit: limit
    }
  })

export const getStudent = (id: number | string) => http.get<Student>(`students/${id}`)

export const updateStudent = (id: number | string, student: Student) => http.put<Student>(`students/${id}`, student)

// thêm một học sinh
export const addStudent = (student: Omit<Student, 'id'>) => {
  return http.post<Student>('/students', student)
}
