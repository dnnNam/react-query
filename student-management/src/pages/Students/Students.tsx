import { useMutation, useQuery } from '@tanstack/react-query'
import { deleteStudent, getStudents } from 'apis/students.api'
import classNames from 'classnames'
import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useQueryString } from 'utils/utils'
// khi type giống với class thì sẽ bị lỗi
// Import 'Students' conflicts with local value, so must be declared with a type-only import when 'isolatedModules' is enabled.
// thế nên sẽ as  StudentType
const LIMIT = 10 // số lượng item mỗi trang
export default function Students() {
  // const [students, setStudents] = useState<StudentsType>([])
  // const [isLoading, setIsLoading] = useState<Boolean>(false)
  // // bình thường gọi api sẽ gọi bằng useEffect
  // useEffect(() => {
  //   // mới gọi setLoading là true
  //   setIsLoading(true)
  //   getStudents(1, 10)
  //     .then((res) => {
  //       setStudents(res.data)
  //     })
  //     .finally(() => {
  //       // nếu gọi thất bại hay gọi thành công thì đều vào cái finally này cả
  //       setIsLoading(false)
  //     })
  // }, [])

  // Query là cách khai báo (declarative dependency) rằng UI cần dữ liệu từ một nguồn bất đồng bộ, dữ liệu này được nhận diện bởi 1 khóa duy nhất để quản lí cache và refetch
  // query có thể dùng bất kỳ hàm trả về Promise(GET, POST) miễn là mục đích lấy dữ liệu về server
  // không nên dùng Query nếu API thay đổi resource phía server (thêm xóa sửa dữ liệu) nên dùng Mutation
  // khác với HTTP thuần POST PUT PATCH thì chỉ thay đổi resource phía server , muốn lấy phải get , còn useMutation thây đổi resource phía server invalidate cache , tự gọi lại get
  // kết quả trả ra của userQuery thường là isPending , isError , data, error
  // ngoài ra còn có status để check trạng thái như pending  error , success
  // cũng có thể kiểm tra quá trình fetch dữ liệu bằng fetchStatus fetching --> đang thực hiện gọi API
  // paused ==> đang bị tạm dừng , idle ==> không làm gì cả

  const queryString: { page?: string } = useQueryString()
  // nếu không có page là number thì Number sẽ convert ra NaN (Not a Number)
  const page = Number(queryString.page) || 1 // nếu queryString không có (là undefined) Number convert qua sẽ là kiểu NaN (nhưng mình không muốn nhân Nan thì minh || 1 láy mặc định là 1  )
  // page sẽ lấy từ param
  const studentQuery = useQuery({
    queryKey: ['students', page], // khi component render lần đầu tiên thì getStudent được gọi ---> dữ liệu được tải về --> lưu vào cache với key là 'students'
    queryFn: () => getStudents(page, LIMIT), // nếu conmponent umount rồi sau đó mount lại , hoặc có component khác cũng gọi cùng query key 'students' thì react query không gọi lại
    // API , mà trả  về dữ liệu từ cache
    // KeepPreviousData : giữ lại data trước đó chứ không để undefined , tại nếu gọi trang 2 thì nó phải call API nên isLoading true
    // KeepPreviousData sẽ giúp giữ lại giá trị cũ nên data không còn undefined isLoading false không còn skeleton nữa tránh hiện tượng bị giựt
    keepPreviousData: true
  })

  const deleteStudentMutation = useMutation({
    mutationFn: (id: number | string) => deleteStudent(id),
    onSuccess: (_, id) => {
      toast.success(`delete success student with id ${id} `)
    }
  })

  // vòng đời của caching
  // Query Instance có hoặc không cache data
  // Fetch ngầm (background fetching)
  // các inactive query
  // xóa cache khỏi bộ nhớ (Garbage collection)

  // query key là gì là 1 cái key định danh cho cái query  , react-query quản lý caching dựa trên query key
  // nên đặt query có nghĩa để dễ quản lý và clean code nên đặt query key là mảng
  // nếu định nghĩa bằng object cho dù đổi thứ tự các thuộc tính thì nó vẫn giống nhau
  // cái biến đặt trong query key để phân biệt với các query key khác bắt buộc phải dùng trong query function để khi query key thay đổi
  // thì tự gọi hàm để lấy dữ liệu
  // query function return  về 1  cái promise
  // để làm chức năng phân trang thì server trả về 1 cái response có x-total-count là tổng số item từ đó biết được số lượng trang

  // query function (hàm dùng để fetch dữ liệu trong React Query) có thể là bất kỳ hàm nào miễn là nó trả về 1 Promise
  // query function có thể nhận vào querykey nếu không nhận thì phải phụ thuộc vào biến bên ngoài ,
  // signal : nhân đối tượng abortSignal dùng để hủy request nếu cần
  // meta(optional ) : bổ sung query truyền dữ liệu riêng biệt cho từng query
  // để tanstack query xác định một truy vấn lỗi , hàm truy vấn phải throw hoặc trả về 1 Promise reject
  // nếu dùng fetch thì phải ném ra lỗi nhưng khi dùng axios thì không cần
  // có 2 cách viết truyền biến vào  cách 1 truyền thẳng khi dùng useQuerry query key làm tham số truyền vào
  // cách 2 sử dụng QueryFunctionContext để truyền trong cái function gọi API
  // ngoài ra còn có hook useInfiniteQuery có tham số truyền truyền vào query function là pageParam cho biết bạn đang gọi API trang nào trong chuỗi các trang dữ liêuj
  // cho phép phân trang vô hạn dễ dàng: không cần fetch toàn bộ dữ liệu cùng 1 lúc , mà fetch từng trang theo yêu cầu
  // pageParam giúp query function linh hoạt , tự động biết cần fetch trang nào tiếp theo , ứng dụng làm chức năng scroll vô hạn như facebook twitter
  // không nên dùng với dữ liệu nhỏ , tải hết 1 lần được , khi API không hỗ trợ phân trang hoặc phân trang phức tạp

  // query option
  // ngoài còn có stale time : là khoảng thời gian dữ liệu còn mới không cần gọi lại API , cache time là thời gian tồn tại nếu sau khoảng  thời gian nào đó không được dùng
  // nếu không truyền vào staletime mặc định là 0 và cachetime là 5 * 60 * 1000 = 5 phút viết dưới dạng miliseconds  1 giây = 1000 milliseconds 1 phút = 60 giây 5 phút
  // nếu hết hạn Stale , dự liệu xem là (stale) cũ  sẽ refetch
  //stale time mà set là Infinity thì sẽ không bị refetch cho đến khi query bị hủy thủ  công
  //stale time mà set là Static thì sẽ không bị refetch cho dù query bị hủy thủ công hoàn toàn khóa cứng dữ liệu không bao giờ fetch lại nữa
  // cách tốt nhất để tránh việc gọi lại API lại quá nhiều lần (refetch) là staleTime để giữ dữ liệu  mới lâu hơn
  // nhưng ngoài ra bạn cũng có thể tùy chỉnh thời điểm nào sẽ refetch lại , bằng cách refetchOnMount , refetchOnWindowFocus,refetchOnReconnect
  // refetchOnMount : có refetch lại khi component mount lại (ví dụ quay lại trang)
  // refetchOnWindowFocus: có refetch khi người dùng quay lại tab trình duyệt
  //refetchOnReconnect : có refetch lại khi mạng bị mất kết nối lại
  // nếu như dữ liệu của query đang stale (cũ) thì React Query sẽ tự động gọi lại API (refetch) khi có 1 sự kiện sau
  //Khi dữ liệu đã cũ, React Query sẽ tự gọi API lại nếu bạn mở lại component, quay lại tab, hoặc vừa mất mạng xong kết nối lại.

  // ngoài ra query còn có nhiều option khác  như refetchInterval: 10000 cứ 10 giây lại refetch lại 1 lần nó không bị phụ thuộc bởi stale time
  // khi một query không còn được dùng ở đâu nữa (không còn component nào dùng useQuery) thì nó sẽ được gắn nhãn là 'inactive'
  // nhưng vẫn còn nằm trong cache(bộ nhớ) --> chưa bị xóa ngay, nếu sau đó bạn lại dùng lại query đó  ---> nó lấy từ cache ra luôn , không gọi lại API lại
  // khi một query trở thành inactive tức là không còn được sử dụng trong useQuery nó sẽ bị xóa khỏi cache sau 5 phút khoảng thời gian này gọi là cacheTime
  // hay có thể viết là gcTime(viết tắt của Garbage Collection Time) có thể đổi giữ trong 10 phút
  // nếu như gọi API mà thất bại sẽ không báo lỗi luôn mà cố gắng gọi lại 3 lần , mỗi lần gọi lại chờ lâu hơn lần trước sau đó mới thông báo lỗi
  // có thể chỉnh số lần retry : thuộc tính retry , là mỗi lần thử cách nhau nhiêu giây retryDelay
  // kết quả của useQuery mặc định được so sánh cấu trúc (structural sharing) nghĩa là nếu có kết quả mới sẽ so lại với kết quả cũ nếu không có gì thay đổi sẽ không tạo object mới
  // structural sharing: kỹ thuật tái sử vùng nhớ (reference) cho những phần dữ liệu không thay đổi nhằm tiết kiệm bộ nhớ và giảm số lần render lại không cần thiết
  // structural sharing chỉ hoạt động với dữ liệu JSON-compatible : là những kiểu dữ liệu mà có thẻ được chuyển thành chuỗi bằng JSON.Stringify() mà không bị lỗi
  // String , Number , Boolean , null ,Array , Object
  // thế nên những phần nào thay đổi thì sẽ dùng spread ... giúp react nhận biết nếu như khong có gì thay đổi thì giữ nguyên tránh re-render không cần thiết
  const totalStudentsCount = Number(studentQuery.data?.headers['x-total-count'] || 0) // có một thuộc tính x-totalCount hiển thị số lượng items từ đó chia cho số lượng mỗi trang để ra số trang
  // VD 11.1 thì làm tròn lên 12 trang và ép kiểu sang number nếu là undefined Number ép ra NaN thì lấy là 0
  const totalPage = Math.ceil(totalStudentsCount / LIMIT)

  const handleDelete = (id: number) => {
    deleteStudentMutation.mutate(id)
  }

  return (
    <div>
      <h1 className='text-lg'>Students</h1>
      <div className='mt-6'>
        <Link
          to='/students/add'
          className='text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg 
        text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800'
        >
          Add Student
        </Link>
      </div>

      {studentQuery.isLoading && (
        <div role='status' className='mt-6 animate-pulse'>
          <div className='mb-4 h-4  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10 rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='mb-2.5 h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <div className='h-10  rounded bg-gray-200 dark:bg-gray-700' />
          <span className='sr-only'>Loading...</span>
        </div>
      )}
      {!studentQuery.isLoading && (
        <Fragment>
          <div className='relative mt-6 overflow-x-auto shadow-md sm:rounded-lg'>
            <table className='w-full text-left text-sm text-gray-500 dark:text-gray-400'>
              <thead className='bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400'>
                <tr>
                  <th scope='col' className='py-3 px-6'>
                    #
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Avatar
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Name
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    Email
                  </th>
                  <th scope='col' className='py-3 px-6'>
                    <span className='sr-only'>Action</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {studentQuery.data?.data.map((student) => (
                  // data object phải chấm thuộc tính data
                  <tr
                    key={student.id}
                    className='border-b bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-600'
                  >
                    <td className='py-4 px-6'>{student.id}</td>
                    <td className='py-4 px-6'>
                      <img src={student.avatar} alt='student' className='h-5 w-5' />
                    </td>
                    <th scope='row' className='whitespace-nowrap py-4 px-6 font-medium text-gray-900 dark:text-white'>
                      {student.last_name}
                    </th>
                    <td className='py-4 px-6'>{student.email}</td>
                    <td className='py-4 px-6 text-right'>
                      <Link
                        to={`/students/${student.id}`}
                        className='mr-5 font-medium text-blue-600 hover:underline dark:text-blue-500'
                      >
                        Edit
                      </Link>
                      <button
                        className='font-medium text-red-600 dark:text-red-500'
                        onClick={() => handleDelete(student.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className='mt-6 flex justify-center'>
            <nav aria-label='Page navigation example'>
              <ul className='inline-flex -space-x-px'>
                <li>
                  {page === 1 ? (
                    // nếu như page = 1 không cho previous thì ta trả về cho nó 1 thẻ span không click được
                    <span className='cursor-not-allowed rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'>
                      Previous
                    </span>
                  ) : (
                    // khác 1 thì trả về thẻ Link để click
                    <Link
                      className=' rounded-l-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100
                     hover:text-gray-700 '
                      to={`/students/?page=${page - 1}`}
                    >
                      Previous
                    </Link>
                  )}
                </li>
                {Array(totalPage)
                  .fill(0)
                  .map((_, index) => {
                    const pageNumber = index + 1 // trang đầu phải là trang 1
                    const isActive = page === pageNumber // nếu như cái page trên url  bằng với cái pageNumber item thì nó active
                    return (
                      <li key={pageNumber}>
                        <Link
                          className={classNames(
                            'border border-gray-300   py-2 px-3 leading-tight     hover:bg-gray-100  hover:text-gray-700',
                            {
                              'bg-gray-100 text-gray-700': isActive,
                              'bg-white  text-gray-500': !isActive // khi không có active thì nó mới có bg-white
                            }
                          )}
                          to={`/students?page=${pageNumber}`}
                        >
                          {pageNumber}
                        </Link>
                      </li>
                    )
                  })}
                <li>
                  {page === totalPage ? (
                    <span className='cursor-not-allowed rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700'>
                      Next
                    </span>
                  ) : (
                    <Link
                      className='rounded-r-lg border border-gray-300 bg-white py-2 px-3 leading-tight text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                      to={`/students/?page=${page + 1}`}
                    >
                      Next
                    </Link>
                  )}
                </li>
              </ul>
            </nav>
          </div>
        </Fragment>
      )}
    </div>
  )
}
