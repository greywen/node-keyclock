import { Issuer, BaseClient, TokenSet, RefreshExtras } from 'openid-client';
import * as crypto from 'crypto';

interface IClientParameters {
  issuer: string;
  client_id: string;
  client_secret?: string;
  redirect_uris?: string[];
  response_types?: ResponseType[];
}

interface ICallbackParameters {
  /**
   * 授权成功重定向URL 前端地址
   */
  login_redirect_uri: string;
  code: string;
  session_state: string;
}

interface IAuthorizationParameters {
  /**
   * keycloak登录完成后重定向URL（可以重定向到前端地址/也可以是后台API地址）
   */
  redirect_uri?: string;
}

class NodeKeycloak {
  private static client: BaseClient;
  /**
   * 配置Keycloak相关信息
   * @param issuer eg: https://identity.keycloak.org/realms/master/
   * @param response_types default: ['code']
   * @returns
   */
  static async configure(parameters: IClientParameters) {
    const keycloakIssuer = await Issuer.discover(parameters.issuer);
    NodeKeycloak.client = new keycloakIssuer.Client({
      client_id: parameters.client_id,
      client_secret: parameters.client_secret,
      redirect_uris: parameters.redirect_uris,
      response_types: parameters.response_types || ['code'],
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
   * @param session_state
   * @returns 返回 Token / 用户信息
   */
  static async callback(parameters: ICallbackParameters): Promise<TokenSet> {
    const { login_redirect_uri, code } = parameters;
    return await NodeKeycloak.client.callback(login_redirect_uri, {
      code: parameters.code,
      session_state: parameters.session_state,
    });
  }

  /**
   * 登出
   * @param post_logout_redirect_uri 退出后重定向URL
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
