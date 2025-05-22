import { Client } from "./types";

// Tipo para la creación de cliente
export interface ClientCreate {
  name: string;
  country_id: string;
  plan_id: string;
  terms_and_conditions?: string;
  contract?: string;
  type: "FACTORING";
  contacts: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

// Tipo para la actualización de cliente
export interface ClientUpdate extends ClientCreate {
  id: string;
}

// Tipo para el formulario (puede tener campos adicionales o validaciones específicas del UI)
export interface ClientFormData {
  id?: string;
  name: string;
  country_id: string;
  plan_id: string;
  terms_and_conditions?: string;
  contract?: string;
  type: "FACTORING";
  contacts: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

export class ClientDTO {
  // Convierte datos del formulario al formato para crear/actualizar
  static toAPI(formData: ClientFormData): ClientUpdate {
    return {
      id: formData.id || "",
      name: formData.name,
      country_id: formData.country_id,
      plan_id: formData.plan_id,
      terms_and_conditions: formData.terms_and_conditions,
      contract: formData.contract,
      type: "FACTORING",
      contacts: {
        first_name: formData.contacts.first_name,
        last_name: formData.contacts.last_name,
        email: formData.contacts.email,
      },
    };
  }

  // Convierte la respuesta de la API al formato que necesita el frontend
  static fromAPI(response: Client): Client {
    return response;
  }

  // Convierte datos de la API al formato del formulario
  static toFormData(client: Client): ClientFormData {
    return {
      id: client.id,
      name: client.name,
      country_id: client.country_id,
      plan_id: client.subscriptions[0]?.plan_id || "", // Tomamos el primer plan si existe
      type: "FACTORING",
      contacts: client.contacts[0] || {
        // Tomamos el primer contacto si existe
        first_name: "",
        last_name: "",
        email: "",
      },
      terms_and_conditions: client.terms_and_conditions,
      contract: client.contract,
    };
  }
}
