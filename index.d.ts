/// <reference types="node" />
import { TokenSet, RefreshExtras } from 'openid-client';
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
declare class NodeKeycloak {
    private static client;
    /**
     * 配置Keycloak相关信息
     * @param issuer eg: https://identity.keycloak.org/realms/master/
     * @param client_id
     * @param client_secret
     * @param redirect_uris 登录成功返回URL，URL将会携带code,session_state等参数
     * @param response_types
     * @returns
     */
    static configure(parameters: IClientParameters): Promise<void>;
    /**
     * 获取Keycloak登录界面URL
     * @returns 返回Keycloak登录界面URL
     */
    static authorizationUrl(parameters?: IAuthorizationParameters): Promise<string>;
    /**
     * 登录
     * @param code
     * @param state
     * @param session_state
     * @returns 返回Token 用户信息
     */
    static signin(parameters: ISigninParameters): Promise<TokenSet>;
    /**
     * 登出
     * @param post_logout_redirect_uri 退出之后重定向URL
     * @returns
     */
    static signout(id_token_hint: string, post_logout_redirect_uri?: string | undefined): Promise<string>;
    static refresh(refreshToken: string | TokenSet, extras?: RefreshExtras | undefined): Promise<TokenSet>;
    static userinfo(accessToken: string | TokenSet, options?: {
        method?: 'GET' | 'POST';
        via?: 'header' | 'body';
        tokenType?: string;
        params?: object;
        DPoP?: DPoPInput;
    }): Promise<import("openid-client").UserinfoResponse<import("openid-client").UnknownObject, import("openid-client").UnknownObject>>;
}
export declare type DPoPInput = crypto.KeyObject | Parameters<typeof crypto.createPrivateKey>[0];
export declare type ResponseType = 'code' | 'id_token' | 'code id_token' | 'none' | string;
export default NodeKeycloak;
