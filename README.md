# Vocal Time Counter

## Presentation
Introducing Vocal Time Counter, your trusty Discord companion for tracking your time spent in voice channels! This versatile bot keeps a close eye on your activity, meticulously logging every minute you spend engaged in voice conversations. Whether you're coordinating with friends or collaborating with colleagues, Vocal Time Counter ensures you stay informed about your Discord voice channel usage.

## Informations
The bot may still have some bugs. If you have any suggestions or would like to report a bug, you can contact me through Discord (my tag is ``@pixilie``) or by email at pixilietv@gmail.com.

## How to use it ?
It's very easy, there are two different commands
- ``/time``: Statistics about you
- ``/leaderboard``: Statistics about the server
- ``/delete <user>``: Delete a user or without params all the users from the database and reset time calculation (Admin only)
- ``/register`` : Register the server on the databse (Admin only & mandatory)

## Add it to your server
- Clone the repository
- Create the .env file
Don't forget to add a .env file at the root of the project.
The .env file should look like this:
```env
TOKEN= <bot_token>
CLIENT_ID= <bot_id>
SOURCE_TOKEN= <logtail_api_key>
IS_DEV= "False" | "True"
DEV_GUILD= None | <your_dev_duild_id>
```
- Install bun
- Run ``bun install``
- Install pm2
- Run ``pm2 start --name <name> .`` (Inside bot directory)
