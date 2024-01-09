import * as express from 'express';
import NodeKeycloak from '../';
import * as config from 'config';

const app = express();
const port = 3000;
const configs: IKeyCloakConfig = config.get('keycloak');

interface IKeyCloakConfig {
  issuer: string;
  client_id: string;
  client_secret: string;
  login_redirect_url: string;
  logout_redirect_url: string;
}

app.get('/', async (req, res) => {
  const url = await NodeKeycloak.authorizationUrl();
  console.log('url', url);
  res.writeHead(302, {
    location: url,
  });
  res.end();
});

app.get('/callback', async (req, res) => {
  const { code, session_state, iss } = <
    { code: string; session_state: string; iss: string }
  >req.query;
  console.log('req.query', req.query);
  const result = await NodeKeycloak.callback({
    iss,
    code,
    session_state,
  });
  const userinfo = await NodeKeycloak.userinfo(result!.access_token as string, {
    method: 'GET',
  });
  res.writeHead(200, { 'Content-Type': 'text/html;charset=utf-8' });
  res.write(`
  <h3>Login successful!</h3>
  <p>${JSON.stringify(result)}</p>
  <h3>User info</h3>
  <p>${JSON.stringify(userinfo)}</p>
  <a href="http://localhost:3000/signout?token=${
    result.id_token
  }">Sign Out</a>`);
  res.end();
});

app.get('/signout', async (req, res) => {
  const token = req.query.token as string;
  const url = await NodeKeycloak.signout(token);
  res.writeHead(302, {
    location: url,
  });
  res.end();
});

app.get('/introspect', async (req, res) => {
  const token = req.query.token as string;
  const result = await NodeKeycloak.introspect(token);
  res.send(result);
});

async function start() {
  await NodeKeycloak.configure({
    issuer: configs.issuer,
    client_id: configs.client_id,
    client_secret: configs.client_secret,
    login_redirect_uri: configs.login_redirect_url,
  });
  app.listen(port, () => console.log(`App listening on port ${port}`));
}
start();
