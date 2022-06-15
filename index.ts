import {
  Issuer,
  BaseClient,
  TokenSet,
  RefreshExtras,
  IntrospectionResponse,
} from 'openid-client';
import * as crypto from 'crypto';

interface INodeKeycloakConfig {
  issuer: string;
  client_id: string;
  login_redirect_uri: string;
  logout_redirect_uri?: string;
  client_secret?: string;
  response_types?: ResponseType[];
}

interface ICallbackParameters {
  code: string;
  session_state: string;
}

class NodeKeycloak {
  private static client: BaseClient;
  private static configs: INodeKeycloakConfig;
  /**
   * Configure keyloak
   * @param issuer eg: https://identity.keycloak.org/realms/master/
   * @param client_id
   * @param login_redirect_uri Redirect URI after keycloak login succeed
   * @param response_types default: ['code']
   * @returns
   */
  static async configure(configs: INodeKeycloakConfig) {
    this.configs = configs;
    const keycloakIssuer = await Issuer.discover(configs.issuer);
    NodeKeycloak.client = new keycloakIssuer.Client({
      client_id: configs.client_id,
      client_secret: configs.client_secret,
      response_types: configs.response_types || ['code'],
    });
  }

  static async authorizationUrl(): Promise<string> {
    return await NodeKeycloak.client.authorizationUrl({
      redirect_uri: this.configs.login_redirect_uri,
    });
  }

  /**
   * @param redirect_uri Must be with authorizationurl redirect_uri consistent
   * @param code
   * @param session_state
   * @returns Promise<TokenSet>
   */
  static async callback(parameters: ICallbackParameters): Promise<TokenSet> {
    const { code, session_state } = parameters;
    return await NodeKeycloak.client.callback(this.configs.login_redirect_uri, {
      code: code,
      session_state: session_state,
    });
  }

  static async signout(id_token_hint: string): Promise<string> {
    return await NodeKeycloak.client.endSessionUrl({
      id_token_hint: id_token_hint,
      post_logout_redirect_uri: this.configs.logout_redirect_uri,
    });
  }

  static async refresh(
    refreshToken: string | TokenSet,
    extras?: RefreshExtras | undefined
  ): Promise<TokenSet> {
    return NodeKeycloak.client.refresh(refreshToken, extras);
  }

  static async introspect(token: string): Promise<IntrospectionResponse> {
    return NodeKeycloak.client.introspect(token);
  }

  static async userinfo(
    accessToken: string | TokenSet,
    options?: {
      method?: 'GET' | 'POST';
      via?: 'header' | 'body';
      tokenType?: string;
      params?: object;
      DPoP?: DPoPInput;
    }
  ) {
    return await this.client.userinfo(accessToken, options);
  }
}

export type DPoPInput =
  | crypto.KeyObject
  | Parameters<typeof crypto.createPrivateKey>[0];

export type ResponseType =
  | 'code'
  | 'id_token'
  | 'code id_token'
  | 'none'
  | string;

export default NodeKeycloak;
