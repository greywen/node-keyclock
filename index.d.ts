/// <reference types="node" />
import { TokenSet, RefreshExtras, IntrospectionResponse } from 'openid-client';
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
declare class NodeKeycloak {
    private static client;
    private static configs;
    /**
     * Configure keyloak
     * @param issuer eg: https://identity.keycloak.org/realms/master/
     * @param client_id
     * @param login_redirect_uri Redirect URI after keycloak login succeed
     * @param response_types default: ['code']
     * @returns
     */
    static configure(configs: INodeKeycloakConfig): Promise<void>;
    static authorizationUrl(): Promise<string>;
    /**
     * @param redirect_uri Must be with authorizationurl redirect_uri consistent
     * @param code
     * @param session_state
     * @returns Promise<TokenSet>
     */
    static callback(parameters: ICallbackParameters): Promise<TokenSet>;
    static signout(id_token_hint: string): Promise<string>;
    static refresh(refreshToken: string | TokenSet, extras?: RefreshExtras | undefined): Promise<TokenSet>;
    static introspect(token: string): Promise<IntrospectionResponse>;
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
