# raid-message ![alt text](https://raw.githubusercontent.com/teddykladdkak/raid-message/master/public/ico/icon48x48.png "Logo for Raid Message")
## What is this!
This project aims to replace Facebook, Messenger, Discord, etc. in the pursuit of the next Raid in Pokémon Go. It is currently at the earliest stage of development.

## Config
At the moment, it is very fine-tuned to work in the Lund area, but not a lot of configuration is required to enable you to start your own server for your city.

## Good to know at the start
When the server is started for the first time, you will be given the option to enter the password for the admins in the console. The password is then saved in root "/admin.json".

Specific IP port is change in variable "config" in "/index.js".

### Files created at first launch of server
Link | Stores
--- | ---
"/admin.json" | Password for admins.
"/public/raids.json" | Registerd raids from the users.
"/subscribers.json" | Users that have approved notifications.
"/notificationPrivateKey.json" | PrivateKey for the Web notification API.
"/public/script/notificationPublicKey.js" | PublicKey for the Web notification API.

## Todo
* Clean "raids.json" at the days end.
* Allows users to see who said they are coming.
* Test and debug image to text.
* Load all files from server.. (After debug)
* Make setting for users to only show gyms in a specific area.
* 29/8 ~~Give the user information if no raids are posted (instead of a blank page).~~
* 29/8 ~~Change order of comments.~~
* 30/8 ~~Menu always visible~~
* 30/8 ~~Add time when comment is made.~~
* 30/8 ~~Enlarge buttons and inputs.~~
* 30/8 ~~Users should be able to delete their own posts.~~
* 30/8 ~~Ability to edit post and time.~~
* 30/8 ~~Support for different languages. (Fixed with icons)~~
* 31/8 ~~Script for image to text (Check area of gym and if its ex-raid).~~
* 31/8 ~~Loading icon when image is processed and analyzed.~~
* 31/8 ~~Add ex-raid icon.~~
* 31/8 ~~Link to google maps if location exist.~~
* 31/8 ~~Better handling of broken contact with the server (Create a class that shows to the user that the button is disabled).~~
* 31/8 ~~Users who choose anonymous are now assigned a Pokémon name.~~
* 1/9 ~~Push notifications (probably only android and computer due to iOS do not support this at this time).~~