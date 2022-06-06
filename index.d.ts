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
declare class NodeKeycloak {
    private static client;
    /**
     * 配置Keycloak相关信息
     * @param issuer eg: https://identity.keycloak.org/realms/master/
     * @param response_types default: ['code']
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
     * @param session_state
     * @returns 返回 Token / 用户信息
     */
    static callback(parameters: ICallbackParameters): Promise<TokenSet>;
    /**
     * 登出
     * @param post_logout_redirect_uri 退出后重定向URL
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
