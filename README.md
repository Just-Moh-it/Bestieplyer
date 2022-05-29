
# Bestieplyer

A twitter bot that replies using GPT-3 responses when commanded using twitter mentions.


## Features

- GPT-3 usage for getting amazing responses
- Easily summoned when anyone mentions the users
- Uses essential API access, even for tweet filtered streaming
- User-friendly, uses express for one-time authentication


## Screenshots

![App Screenshot](https://via.placeholder.com/468x300?text=App+Screenshot+Here)


## Tech Stack

**Client:** React, Redux, TailwindCSS

**Server:** Node, Express


## Installation

Install my-project with npm

```bash
  npm install my-project
  cd my-project
```
    
## Usage/Examples

After the installation,
1. Create your twitter API account
1. Obtain an Client Id and Client Secret
1. While creating the OAuth 1.0/2.0 authentication flows:
    - 1. Use `http://127.0.0.1/callback` as the redirect URI 
    - 1. Allow read and write access
    - 1. After this, rename `.env.example` to `.env` in the project root
1. Edit the required values
1. Now, run the express server using `npm run auth-flow`
1. Navigate to twitter and make sure you're logged into the account you'll be automatically replying with
1. Navigate to `http://localhost:3000/auth`
1. Authorize the twitter account
1. Close the running npm script from step `5`
1. Edit the username config variable in `config.js`
1. Now push the stream rules using `npm run update-rules` (for filtering live tweets)
1. Finally, start the bot using `npm start`

After the setup is complete, mention the bot's username with any command, and wait for the reply
## Roadmap

- Improving the prompt for the AI
- Optimizing the code by adding execptions for checking if any of the steps is mis-followed

## Authors

- [@Just-Moh-it](https://www.github.com/Just-Moh-it)


## Acknowledgements

- [Amit Wani @mtwni](https://github.com/mtwn105)
- [Fireship tutorial](https://www.youtube.com/watch?v=V7LEihbOv3Y&ab_channel=Fireship)
- [Readme Generator - Readme.so](https://readme.so)


## License

[MIT](/license) - For completely open use and transperant community improvments

