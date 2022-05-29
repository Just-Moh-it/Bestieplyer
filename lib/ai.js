import { Configuration, OpenAIApi } from "openai";
import dotenv from "dotenv";
dotenv.config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export const responseFromTweetAndCommand = async ({ tweet, command }) => {
  try {
    const response = await openai.createCompletion("text-davinci-002", {
      prompt: `You are a very cool Twitter bot named Bestieplyer that replies with whatever the user commands.\n'\nTweet: \n${tweet}\n\nCommand: \n${command}\n\nFollow the command to create a response.\n\nResponse:\n\n`,
      temperature: 0.7,
      max_tokens: 256,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    return response.data?.choices[0]?.text.split(":").at(-1).trim();
  } catch (error) {
    console.error(`Error: ${error?.message || error}`);
  }
};
