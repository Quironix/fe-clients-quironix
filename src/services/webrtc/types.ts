export interface ProvisionRequest {
  username: string;
  password: string;
}

export interface ProvisionResponse {
  status: "ok" | "error";
  message?: string;
  sip_user?: string;
  sip_pass?: string;
  sip_domain?: string;
  ws_uri?: string;
}

export interface WebRTCCredentials {
  sipUser: string;
  sipPass: string;
  sipDomain: string;
  wsUri: string;
}
