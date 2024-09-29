# Vocal Time Counter

## Presentation
Introducing Vocal Time Counter, your trusty Discord companion for tracking your time spent in voice channels! This versatile bot keeps a close eye on your activity, meticulously logging every minute you spend engaged in voice conversations. Whether you're coordinating with friends or collaborating with colleagues, Vocal Time Counter ensures you stay informed about your Discord voice channel usage.

## Informations
The bot is still in developement and may still have some bugs. If you have any suggestions or would like to report a bug, you can contact me through Discord (my tag is Kristen#1827) or by email at kristen.couty@gmail.com or contact me on discord (`pixilie`).

## How to use it ?
It's very easy, there are two different commands
- ``/time``: Statistics about you
- ``/leaderboard``: Statistics about the server
- ``/delete <user>``: Delete a user or without params all the users from the database
- Context commands are also avaible by right clicking on a user


## Add it to your server
- Clone the repository
- Create the .env file
Don't forget to add a .env file at the root of the project.
The .env file should look like this:
```env
TOKEN= (bot key)
CLIENT_ID= (Bot id)
SOURCE_TOKEN= (Logtail key)
IS_DEV= False | True (if you want the log to be redirected in your console)
DEV_GUILD= (The guild where you want to locally register /commands => Faster for dev and no need to refresh discord)
```
- Install bun
- Run ``bun install``
- Install pm2
- Run ``pm2 start --name <name> .``
