// Compatibility shim. ToastNotifier now lives in @lwm/ui. Existing default
// imports `from '@/ui/ToastNotifier'` keep working — the @lwm/ui barrel
// only ships named, so we alias to default here.
export {
  ToastNotifier,
  type ToastNotifierHandle,
  type ToastNotifierType as ToastType,
} from '@lwm/ui'
import { ToastNotifier as ToastNotifierComponent } from '@lwm/ui'
export default ToastNotifierComponent
