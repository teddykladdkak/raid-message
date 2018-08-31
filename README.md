# raid-message
## What is this!
This project aims to replace Facebook, Messenger, Discord, etc. in the pursuit of the next Raid in Pokémon Go. It is currently at the earliest stage of development.

## Config
At the moment, it is very fine-tuned to work in the Lund area, but not a lot of configuration is required to enable you to start your own server for your city.

## Good to know at the start
When the server is started for the first time, you will be given the option to enter the password for the admins in the console. The password is then saved in root "/admin.json".

All raids are saved in the file "public/raids.js", this file is created automatically when the server is started the first time.

Specific IP port is change in variable "config" in "/index.js".

## Todo
* Clean "raids.json" at the days end.
* Allows users to see who said they are coming.
* Push notifications (probably only android and computer due to iOS do not support this at this time).
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