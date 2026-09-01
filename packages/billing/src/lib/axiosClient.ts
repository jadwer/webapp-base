// El interceptor Bearer vive en @lwm/auth; este shim conserva el
// default-export que los services y sus tests (vi.mock por path) esperan.
import { axiosClient } from '@lwm/auth'
export default axiosClient
