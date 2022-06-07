"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const openid_client_1 = require("openid-client");
class NodeKeycloak {
    /**
     * Configure keyloak
     * @param issuer eg: https://identity.keycloak.org/realms/master/
     * @param client_id
     * @param login_redirect_uri Redirect URI after keycloak login succeed
     * @param response_types default: ['code']
     * @returns
     */
    static async configure(configs) {
        this.configs = configs;
        const keycloakIssuer = await openid_client_1.Issuer.discover(configs.issuer);
        NodeKeycloak.client = new keycloakIssuer.Client({
            client_id: configs.client_id,
            client_secret: configs.client_secret,
            response_types: configs.response_types || ['code'],
        });
    }
    static async authorizationUrl() {
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
    static async callback(parameters) {
        const { code, session_state } = parameters;
        return await NodeKeycloak.client.callback(this.configs.login_redirect_uri, {
            code: code,
            session_state: session_state,
        });
    }
    static async signout(id_token_hint) {
        return await NodeKeycloak.client.endSessionUrl({
            id_token_hint: id_token_hint,
            post_logout_redirect_uri: this.configs.logout_redirect_uri,
        });
    }
    static async refresh(refreshToken, extras) {
        return NodeKeycloak.client.refresh(refreshToken, extras);
    }
    static async introspect(token) {
        return NodeKeycloak.client.introspect(token);
    }
    static async userinfo(accessToken, options) {
        return await this.client.userinfo(accessToken, options);
    }
}
exports.default = NodeKeycloak;
//# sourceMappingURL=index.js.map