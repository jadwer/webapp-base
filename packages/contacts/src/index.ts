/**
 * CONTACTS MODULE - MAIN EXPORTS
 * Centralized exports siguiendo patrón de otros módulos
 */

// Types
export type {
  Contact,
  ContactParsed,
  ContactAddress,
  ContactDocument,
  ContactPerson,
  ContactFilters,
  UseContactsParams,
  CreateContactData,
  UpdateContactData,
  ContactFormData
} from './types'

// Hooks
export {
  useContacts,
  useContact,
  useContactMutations,
  useContactsByType,
  useCustomers,
  useSuppliers,
  useProspects,
  useActiveContacts,
  parseContact
} from './hooks'

// Services
export {
  contactsService,
  contactAddressesService,
  contactDocumentsService,
  contactPeopleService
} from './services'

// Components
export {
  ContactsAdminPageReal,
  ContactsTableSimple,
  FilterBar,
  PaginationSimple,
  ContactForm,
  ContactFormTabs,
  ContactViewTabs,
  ContactAddresses,
  ContactDocuments,
  ContactPeople
} from './components'

// Utils
export { getValidationErrorMessages } from './utils/jsonApiErrors'

// Components to be added in future phases
// export { ContactView } from './components/ContactView'
// export { ContactFormWrapper } from './components/ContactFormWrapper'