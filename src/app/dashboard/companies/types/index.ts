export interface Company {
  id?: string;
  name: string;
  dni_type: string;
  dni_number: string;
  client_code: string;
  address: Address[];
  contacts: Contact[];
  category: string;
}

export interface Contact {
  name: string;
  email: string;
  phone: string;
  position: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
}
