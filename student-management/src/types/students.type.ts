// đây là kiểu student item
export interface Student {
  id: number
  first_name: string
  last_name: string
  email: string
  gender: string
  country: string
  avatar: string
  btc_address: string
}

// kiểu studentList để tiện lợi hơn chúng ta không cần khai báo lại
// chúng ta có thể tái sử dụng lại method Pick của typeScript
export type Students = Pick<Student, 'id' | 'email' | 'avatar' | 'last_name'>[]
