import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { addStudent, getStudent, updateStudent } from 'apis/students.api'
import { useEffect, useMemo, useState } from 'react'
import { useMatch, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { Student } from 'types/students.type'
import { isAxiosError } from 'utils/utils'

type FormStateType = Omit<Student, 'id'> | Student
const initialFormState: FormStateType = {
  avatar: '',
  email: '',
  btc_address: '',
  country: '',
  first_name: '',
  gender: 'other',
  last_name: ''
}

type FormError =
  | {
      [key in keyof FormStateType]: string
    }
  | null

const genders = {
  male: 'Male',
  female: 'Female',
  other: 'Other'
}

export default function AddStudent() {
  const [formState, setFormState] = useState<FormStateType>(initialFormState)
  const addMatch = useMatch('/students/add') // kiểm tra xem có phải chế độ add không nếu là edit trả về null
  const isAddMode = Boolean(addMatch)
  // làm chức năng edit
  const { id } = useParams()
  const queryClient = useQueryClient() // tham chiếu tới thằng trong index
  const addMutationStudent = useMutation({
    mutationFn: (body: FormStateType) => {
      // handle data
      return addStudent(body)
    }
  })
  // lấy infor của một student lên form
  const studentQuery = useQuery({
    queryKey: ['student', id],
    queryFn: () => getStudent(id as string),
    // có data thì mới enable
    // không muốn gọi lại API set Stale time
    staleTime: 1000 * 10,
    enabled: id !== undefined
  })

  useEffect(() => {
    if (studentQuery.data) {
      setFormState(studentQuery.data.data)
    }
  }, [studentQuery.data])

  // update người dùng
  const updateStudentMutation = useMutation({
    mutationFn: (_) => updateStudent(id as string, formState as Student),
    onSuccess: (data) => {
      // kiểm tra data phải có cùng kiểu với nhau
      // cập nhập lại query key
      // làm chức năng update xong phải cập nhập lại data
      queryClient.setQueryData(['student', id], data) // data chỉ là object , truyền đúng
    }
  })

  const errorForm: FormError = useMemo(() => {
    const error = isAddMode ? addMutationStudent.error : updateStudentMutation.error
    if (isAxiosError<{ error: FormError }>(error) && error.response?.status === 422) {
      return error.response?.data.error
    }
    return null
  }, [addMutationStudent.error, isAddMode, updateStudentMutation.error])

  // dùng currying
  const handleChange = (name: keyof FormStateType) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormState((prev) => ({ ...prev, [name]: event.target.value }))
    // muốn khi báo lỗi mình gõ lại vào ô có lỗi lỗi sẽ biến mất
    // thì mutation có cung cấp hàm reset
    // nếu có data hoặc lỗi thì reset trang thái ban đầu
    if (addMutationStudent.data || addMutationStudent.error) {
      addMutationStudent.reset()
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isAddMode) {
      addMutationStudent.mutate(formState, {
        onSuccess: () => {
          // cách 1
          // nếu thành công thì reset form
          setFormState(initialFormState)
          toast.success('Add successfully')
        }
      })
    } else {
      // vì hàm update không cần dùng tham số mà dùng trực tiếp biến id là formState , nên để undefined (bắt buộc) mới dùng được options
      // khác với cách viết trên add có 2 cách hơi khó lú
      updateStudentMutation.mutate(undefined, {
        onSuccess: (_) => {
          toast.success('Update successfully')
        }
      })
    }
  }

  return (
    <div>
      <h1 className='text-lg'>{isAddMode ? 'Add' : 'Edit'} Student</h1>
      {/* nếu chọn Add student sẽ hiển thị add Student , nếu bấm vào edit sẽ hiển thị Edit Student  */}
      <form className='mt-6' onSubmit={handleSubmit}>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            type='text'
            name='floating_email'
            id='floating_email'
            className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 
           bg-white py-2.5 px-0 text-sm text-gray-900 
           focus:border-blue-600 focus:outline-none focus:ring-0'
            placeholder=' '
            value={formState.email}
            onChange={handleChange('email')}
            required
          />
          <label
            htmlFor='floating_email'
            className='absolute top-3  origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
          >
            Email address
          </label>
          {errorForm && (
            <p className='mt-2 text-sm text-red-600'>
              <span className='font-medium'>Lỗi!</span>
              {errorForm.email}
            </p>
          )}
        </div>

        <div className='group relative z-0 mb-6 w-full'>
          <div>
            <div>
              <div className='mb-4 flex items-center'>
                <input
                  id='gender-1'
                  type='radio'
                  name='gender'
                  value={genders.male}
                  checked={formState.gender === genders.male}
                  onChange={handleChange('gender')}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600  dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                />
                <label htmlFor='gender-1' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Male
                </label>
              </div>
              <div className='mb-4 flex items-center'>
                <input
                  id='gender-2'
                  type='radio'
                  name='gender'
                  value={genders.female}
                  checked={formState.gender === genders.female}
                  onChange={handleChange('gender')}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600  dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                />
                <label htmlFor='gender-2' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Female
                </label>
              </div>
              <div className='flex items-center'>
                <input
                  id='gender-3'
                  type='radio'
                  name='gender'
                  value={genders.other}
                  checked={formState.gender === genders.other}
                  onChange={handleChange('gender')}
                  className='h-4 w-4 border-gray-300 bg-gray-100 text-blue-600  dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-blue-600'
                />
                <label htmlFor='gender-3' className='ml-2 text-sm font-medium text-gray-900 dark:text-gray-300'>
                  Other
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className='group relative z-0 mb-6 w-full'>
          <input
            type='text'
            name='country'
            id='country'
            value={formState.country}
            onChange={handleChange('country')}
            className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 
           bg-white py-2.5 px-0 text-sm text-gray-900 
           focus:border-blue-600 focus:outline-none focus:ring-0'
            placeholder=' '
            required
          />
          <label
            htmlFor='country'
            className='absolute top-3 origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
          >
            Country
          </label>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='tel'
              name='first_name'
              id='first_name'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 
           bg-white py-2.5 px-0 text-sm text-gray-900 
           focus:border-blue-600 focus:outline-none focus:ring-0'
              placeholder=' '
              required
              value={formState.first_name}
              onChange={handleChange('first_name')}
            />
            <label
              htmlFor='first_name'
              className='absolute top-3  origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              First Name
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='last_name'
              id='last_name'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 
           bg-white py-2.5 px-0 text-sm text-gray-900 
           focus:border-blue-600 focus:outline-none focus:ring-0'
              placeholder=' '
              required
              value={formState.last_name}
              onChange={handleChange('last_name')}
            />
            <label
              htmlFor='last_name'
              className='absolute top-3  origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              Last Name
            </label>
          </div>
        </div>
        <div className='grid md:grid-cols-2 md:gap-6'>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='avatar'
              id='avatar'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 
           bg-white py-2.5 px-0 text-sm text-gray-900 
           focus:border-blue-600 focus:outline-none focus:ring-0'
              placeholder=' '
              required
              value={formState.avatar}
              onChange={handleChange('avatar')}
            />
            <label
              htmlFor='avatar'
              className='absolute top-3  origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              Avatar Base64
            </label>
          </div>
          <div className='group relative z-0 mb-6 w-full'>
            <input
              type='text'
              name='btc_address'
              id='btc_address'
              className='peer block w-full appearance-none border-0 border-b-2 border-gray-300 
           bg-white py-2.5 px-0 text-sm text-gray-900 
           focus:border-blue-600 focus:outline-none focus:ring-0'
              placeholder=' '
              required
              value={formState.btc_address}
              onChange={handleChange('btc_address')}
            />
            <label
              htmlFor='btc_address'
              className='absolute top-3    origin-[0] -translate-y-6 scale-75 transform text-sm text-gray-500 duration-300 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:left-0 peer-focus:-translate-y-6 peer-focus:scale-75 peer-focus:font-medium peer-focus:text-blue-600 dark:text-gray-400 peer-focus:dark:text-blue-500'
            >
              BTC Address
            </label>
          </div>
        </div>

        <button
          type='submit'
          className='w-full rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 sm:w-auto'
        >
          {isAddMode ? 'Add' : 'Update'}
        </button>
      </form>
    </div>
  )
}
