import * as express from 'express';
import JustNodeKeycloak from '../';
import * as config from 'config';

const app = express();
const port = 3000;
const configs: IKeyCloakConfig = config.get('keycloak');

interface IKeyCloakConfig {
  issuer: string;
  client_id: string;
  client_secret: string;
  response_types: string[];
  redirect_uris: string[];
  login_redirect_url: string;
  logout_redirect_url: string;
}

app.get('/authorizationurl', async (req, res) => {
  const url = await JustNodeKeycloak.authorizationUrl();
  res.writeHead(302, {
    location: url,
  });
  res.end();
});

app.get('/', async (req, res) => {
  const { code, session_state } = <{ code: string; session_state: string }>(
    req.query
  );
  const result = await JustNodeKeycloak.signin({
    login_redirect_uri: configs.login_redirect_url,
    code: code,
    session_state: session_state,
  });
  const userinfo = await JustNodeKeycloak.userinfo(
    result!.access_token as string
  );
  res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
  res.write(`
  <h3>登录成功!</h3>
  <p>${JSON.stringify(result)}</p>
  <h3>用户信息</h3>
  <p>${JSON.stringify(userinfo)}</p>
  <a href="http://localhost:3000/signout?token=${result.id_token}">登出</a>`);
  res.end();
});

app.get('/signout', async (req, res) => {
  const token = req.query.token as string;
  const url = await JustNodeKeycloak.signout(
    token,
    configs.logout_redirect_url
  );
  res.writeHead(302, {
    location: url,
  });
  res.end();
});

async function start() {
  await JustNodeKeycloak.configure({
    issuer: configs.issuer,
    client_id: configs.client_id,
    client_secret: configs.client_secret,
    response_types: configs.response_types,
    redirect_uris: configs.redirect_uris,
  });
  app.listen(port, () => console.log(`App listening on port ${port}`));
}
start();
