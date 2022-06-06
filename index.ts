import { Issuer, BaseClient, TokenSet, RefreshExtras } from 'openid-client';
import * as crypto from 'crypto';

interface IClientParameters {
  issuer: string;
  client_id: string;
  client_secret?: string;
  redirect_uris?: string[];
  response_types?: ResponseType[];
}

interface ISigninParameters {
  login_redirect_uri: string;
  code: string;
  state?: string;
  session_state?: string;
}

interface IAuthorizationParameters {
  redirect_uri?: string;
  max_age?: number;
}

class NodeKeycloak {
  private static client: BaseClient;
  /**
   * 配置Keycloak相关信息
   * @param issuer eg: https://identity.keycloak.org/realms/master/
   * @param client_id
   * @param client_secret
   * @param redirect_uris 登录成功返回URL，URL将会携带code,session_state等参数
   * @param response_types
   * @returns
   */
  static async configure(parameters: IClientParameters) {
    const keycloakIssuer = await Issuer.discover(parameters.issuer);
    NodeKeycloak.client = new keycloakIssuer.Client({
      client_id: parameters.client_id,
      client_secret: parameters.client_secret,
      redirect_uris: parameters.redirect_uris,
      response_types: parameters.response_types,
    });
  }

  /**
   * 获取Keycloak登录界面URL
   * @returns 返回Keycloak登录界面URL
   */
  static async authorizationUrl(
    parameters?: IAuthorizationParameters
  ): Promise<string> {
    return await NodeKeycloak.client.authorizationUrl({ ...parameters });
  }

  /**
   * 登录
   * @param code
   * @param state
   * @param session_state
   * @returns 返回Token 用户信息
   */
  static async signin(parameters: ISigninParameters): Promise<TokenSet> {
    const { login_redirect_uri, code } = parameters;
    return await NodeKeycloak.client.callback(login_redirect_uri, {
      code: parameters.code,
      state: parameters.state,
      session_state: parameters.session_state,
    });
  }

  /**
   * 登出
   * @param post_logout_redirect_uri 退出之后重定向URL
   * @returns
   */
  static async signout(
    id_token_hint: string,
    post_logout_redirect_uri?: string | undefined
  ): Promise<string> {
    return await NodeKeycloak.client.endSessionUrl({
      id_token_hint: id_token_hint,
      post_logout_redirect_uri: post_logout_redirect_uri,
    });
  }

  static async refresh(
    refreshToken: string | TokenSet,
    extras?: RefreshExtras | undefined
  ): Promise<TokenSet> {
    return NodeKeycloak.client.refresh(refreshToken, extras);
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
