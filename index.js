import needle from "needle";
import { responseFromTweetAndCommand } from "./lib/ai.js";
import { reply } from "./lib/createTweet.js";
import dotenv from "dotenv";
dotenv.config();

const token = process.env.BEARER_TOKEN;

const streamURL =
  "https://api.twitter.com/2/tweets/search/stream?expansions=referenced_tweets.id,entities.mentions.username&tweet.fields=created_at,text,entities";

const replyURL = "https://api.twitter.com/2/tweets";

// Actively listens for tweets and filters required ones
function streamConnect(retryAttempt) {
  // Executed when a tweet is found
  const handleStream = async (data) => {
    try {
      if (data?.toJSON()?.data?.length > 5 && data) {
        console.log("💿 Recieved Data!");
        const {
          data: {
            id: requestTweetId,
            text: requestTweetTextRaw,
            entities: { mentions: requestTweetMentions },
          },
          includes: { tweets: sourceTweets },
        } = JSON.parse(data);

        let last = 0;

        for (const mention of requestTweetMentions) {
          if (mention.start === last || mention.start === last + 1) {
            last = mention.end;
          }
        }

        const command = requestTweetTextRaw.slice(last + 1);
        const tweet = sourceTweets[0].text;

        // Get the completion
        const completion = await responseFromTweetAndCommand({
          tweet,
          command,
        });

        // Send the reply
        await reply({
          query: { content: completion, replyId: requestTweetId },
        });

        // A successful connection resets retry count.
        retryAttempt = 0;
      }
    } catch (e) {
      if (
        data.detail ===
        "This stream is currently at the maximum allowed connection limit."
      ) {
        console.error("🛑", data.detail);
        process.exit(1);
      } else {
        console.error("🛑 Error:", e?.message);
      }
    }
  };

  // Executed when an error occurs
  const handleError = (error) => {
    if (error.code !== "ECONNRESET") {
      console.log(error.code);
      process.exit(1);
    } else {
      // This reconnection logic will attempt to reconnect when a disconnection is detected.
      // To avoid rate limits, this logic implements exponential backoff, so the wait time
      // will increase if the client cannot reconnect to the stream.
      setTimeout(() => {
        console.warn("⚠️ A connection error occurred. Reconnecting...");
        streamConnect(++retryAttempt);
      }, 2 ** retryAttempt);
    }
  };

  // Listen for stream
  const stream = needle.get(streamURL, {
    headers: {
      "User-Agent": "v2FilterStreamJS",
      Authorization: `Bearer ${token}`,
    },
    timeout: 20000,
  });

  // Console.log when stream connected
  console.log("🚀 Started listening to stream at", (new Date()).toLocaleString());

  // When a tweet is found, handle data or error
  stream.on("data", handleStream).on("err", handleError);

  return stream;
}

(async () => {
  // Listen to the stream.
  streamConnect(0);
})();
