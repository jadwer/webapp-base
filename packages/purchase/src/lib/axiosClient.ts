// El interceptor Bearer vive en @lwm/auth; shim para conservar el
// default-export que services y mocks por path esperan.
import { axiosClient } from '@lwm/auth'
export default axiosClient
