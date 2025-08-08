import axios, { AxiosInstance } from 'axios'
class Http {
  instance: AxiosInstance
  constructor() {
    this.instance = axios.create({
      baseURL: 'http://localhost:4000/', // của API của server test
      timeout: 10000,
      headers: {
        'content-Type': 'application/json' // muốn nhận và gửi liểu dữ liệu Json
      }
    })
  }
}

const http = new Http().instance

export default http
