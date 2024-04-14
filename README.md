# Vocal Time Counter
Version: 1.00 (Stable)    
By: Kristen

## Presentation
Introducing Vocal Time Counter, your trusty Discord companion for tracking your time spent in voice channels! This versatile bot keeps a close eye on your activity, meticulously logging every minute you spend engaged in voice conversations. Whether you're coordinating with friends or collaborating with colleagues, Vocal Time Counter ensures you stay informed about your Discord voice channel usage.

## Informations
The bot is currently on version 1.0.0 and may still have some bugs. If you have any suggestions or would like to report a bug, you can contact me through Discord (my tag is Kristen#1827) or by email at pixilietv@gmail.com. You can also join my Discord server at https://discord.gg/wcy22GAmDG to discuss the bot or share feedback.  

## How to use it ?
It's very easy, there are two different commands
- ``/time``: Statistics about you
- ``/leaderboard``: Statistics about the server
  

## Add it to your server
- Clone the repository
- Create the .env file
Don't forget to add a .env file at the root of the project.  
The .env file should look like this:
```env
TOKEN=your_bot_token
CLIENT_ID=your_bot_id
```
- Install docker
- Open a terminal in the bot's directory and run ``sudo docker build . 't vocaltime``
- Run ``sudo docker run -d --rm vocaltime``
