# SSO login with Directus

At this moment, SSO authentication in Directus can only be made with cookies.

So there's two ways you can do SSO authentication:

1. Share same domain of your implementation with Directus instance. This is the most secure and easiest way.
2. Authenticate directly with Directus

## Share same domain

With this option, all the cookies will be under the same domain so it's easy to just use them to make requests to Directus.

For example:
You want to make Directus authenticated requests on your app.
For this your users will login in your webapp which will use Directus OpenId authentication provider.
Your project is on subdomain `myproject.example.com` and your Directus project is under `directus.example.com`

For this to work you first need to configure your Directus with the following configurations:

```
PUBLIC_URL: directus.example.com
AUTH_PROVIDERS: openid
AUTH_OPENID_DRIVER: openid
AUTH_OPENID_CLIENT_ID: <CLIENT_ID>
AUTH_OPENID_CLIENT_SECRET: <CLIENT_SECRET>
AUTH_OPENID_ISSUER_URL: <ISSUER_URL>
AUTH_OPENID_ALLOW_PUBLIC_REGISTRATION: true/false
AUTH_OPENID_DEFAULT_ROLE_ID: <DIRECTUS_DEFAULT_ROLE_ID>
AUTH_OPENID_MODE: cookie
AUTH_OPENID_REDIRECT_ALLOW_LIST: https://myproject.example.com/me
REFRESH_TOKEN_COOKIE_DOMAIN: example.com
```

On your provider (like Azure, Google or any other) you need to add the following URI:

```
https://directus.example.com/auth/login/openid/callback
```

Then have your SSO users to go into:

```
https://directus.example.com/auth/login/openid?redirect=https://myproject.example.com/me
```

After the successful login on the SSO, your users will be redirected to `https://myproject.example.com/me`.
In this `/me` server side route you will have access to the cookie `directus_refresh_token`, so you just need to call the refresh endpoint with this refresh token in order to have an access token. With the access token you can now request data to Directus. Here's Node/Express example:

```js
// Example with express
req.get("/me", async (req, res, next) => {
  const { access_token } = await directus.post("/auth/refresh", {
    mode: "cookie",
    refresh_token: req.cookies["directus_refresh_token"],
  });

  const me = await directus.get("/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  res.render("me", { user: me });
});
```

You can also store this access token so it's faster to retrieve data from Directus like:

```js
// Example with express
req.get("/me", async (req, res, next) => {
  let access_token =
    req.cookies.access_token ||
    (await directus
      .post("/auth/refresh", {
        mode: "cookie",
        refresh_token: req.cookies["directus_refresh_token"],
      })
      .then((r) => r.access_token));

  const me = await directus.get("/me", {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  res.cookie("access_token", access_token);
  res.render("me", { user: me });
});
```

## Across domains

Since cookies cannot be shared across domains, all Directus authentications needs to be made on client side.
However, we can send the access token to our server after the authentication on Directus.

For example:
You want to make Directus authenticated requests on your app.
For this your users will login in your webapp which will use Directus OpenId authentication provider.
Your project is on a different subdomain `myproject.test.com` than your Directus project which is under `directus.example.com`

For this to work you first need to configure your Directus with the following configurations:

```
PUBLIC_URL: directus.example.com
AUTH_PROVIDERS: openid
AUTH_OPENID_DRIVER: openid
AUTH_OPENID_CLIENT_ID: <CLIENT_ID>
AUTH_OPENID_CLIENT_SECRET: <CLIENT_SECRET>
AUTH_OPENID_ISSUER_URL: <ISSUER_URL>
AUTH_OPENID_ALLOW_PUBLIC_REGISTRATION: true/false
AUTH_OPENID_DEFAULT_ROLE_ID: <DIRECTUS_DEFAULT_ROLE_ID>
AUTH_OPENID_MODE: cookie
AUTH_OPENID_REDIRECT_ALLOW_LIST: https://myproject.test.com/me

REFRESH_TOKEN_COOKIE_SECURE: true
REFRESH_TOKEN_COOKIE_SAME_SITE: None
```

Notice now that your Directus project needs to be under `https` protocol because of `REFRESH_TOKEN_COOKIE_SECURE: true`.

On your provider (like Azure, Google or any other) you need to add the following URI:

```
https://directus.example.com/auth/login/openid/callback
```

Then have your SSO users to go into:

```
https://directus.example.com/auth/login/openid?redirect=https://myproject.test.com/me
```

After the successful login on the SSO, your users will be redirected to `https://myproject.test.com/me`.
In this `/me` client side route you still don't have an access token to communicate with Directus so you need to call the refresh endpoint with `credentials: include` as the Javascript request needs to send cookies to Directus. This will give an access token which can now be used to request data to Directus.

In this repo you can find and example using this approach
