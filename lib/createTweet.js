import dotenv from "dotenv";
import express from "express";
import ls from "node-localstorage";
import twit from "twitter-api-v2";
import url from "url";
dotenv.config();

var LocalStorage = ls.LocalStorage;
const localStorage = new LocalStorage("../storage");

// Twitter Initialize
const TwitterApi = twit.default;
const twitterClient = new TwitterApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
});

// Express Initialize
const app = express();
const PORT = process.env.PORT || 3000;

const callbackURL = "http://127.0.0.1:3000/callback";

// STEP 1 - Auth URL
const auth = (request, response) => {
  const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
    callbackURL,
    { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] }
  );

  // store verifier
  localStorage.setItem("codeVerifier", codeVerifier);
  localStorage.setItem("state", state);

  response.redirect(url);
};

// STEP 2 - Verify callback code, store access_token
const callback = async (request, response) => {
  try {
    const { state, code } = request.query;

    const codeVerifier = localStorage.getItem("codeVerifier");
    const storedState = localStorage.getItem("state");

    if (state !== storedState) {
      return response.status(400).send("Stored tokens do not match!");
    }

    const {
      client: loggedClient,
      accessToken,
      refreshToken,
    } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: callbackURL,
    });

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    const { data } = await loggedClient.v2.me(); // start using the client if you want

    response.send({ data });

    return data;
  } catch (error) {
    return response.status(500).json({ message: error?.message });
  }
};

// STEP 3 - Refresh tokens and post tweets
export const reply = async (request, response) => {
  const refreshToken = localStorage.getItem("refreshToken");
  const { content, replyId } = request.query;

  const {
    client: refreshedClient,
    accessToken,
    refreshToken: newRefreshToken,
  } = await twitterClient.refreshOAuth2Token(refreshToken);

  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("refreshToken", newRefreshToken);

  const { data } = await refreshedClient.v2.reply(content, replyId);

  try {
    response.send(data);
  } catch {}
  return data;
};

// Check if the file is called natively using cli or imported
if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  // If yes, then start the express server
  app.get("/auth", auth);
  app.get("/callback", callback);
  app.get("/reply", reply);

  // Start listening on PORT
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
