# ![alt text](https://raw.githubusercontent.com/teddykladdkak/raid-message/master/public/ico/icon48x48.png "Logo for Raid Message") Raid Message
## What is this!
This project aims to replace Facebook, Messenger, Discord, etc. in the pursuit of the next Raid in Pokémon Go. It is currently at the earliest stage of development.

## Config
At the moment, it is very fine-tuned to work in the Lund area, but not a lot of configuration is required to enable you to start your own server for your city.

## Good to know at the start
When the server is started for the first time, you will be given the option to enter the password for the admins in the console. The password is then saved in root "/admin.json".

Specific IP port is change in variable "config" in "/index.js".

## Customize
### Files created at first launch of server
Link | Stores
--- | ---
"/admin.json" | Password for admins.
"/public/raids.json" | Registerd raids from the users.
"/subscribers.json" | Users that have approved notifications.
"/notificationPrivateKey.json" | PrivateKey for the Web notification API.
"/public/script/notificationPublicKey.js" | PublicKey for the Web notification API.
"/public/script/geofence.js" | Geofence coordinates of specific areas.

### Add Pokémon Gyms
In my case I have in another project created a list of all the Pékemon Go gyms in my city. In order for the code to read which gym the user has sent a screen shot on, it must be compared to the list of all gyms in your city.

To get this information you can find it at: [PokemonGoMap](https://www.pokemongomap.info/).

You need to create a ".js" file and change "https: //gymlund.tk ..." in "index.html" to your list.

The code is like below:
```
var gyms = [
	{
		"namn": "[Name of gym]",
		"location": {
			"longitud": "[Longitude]",
			"latitud": "[Latitude]"
		},
		"exraid": [true or false]
	},{
		"namn": "Papegojelyckans lekplats",	//Example
		"location": {
			"longitud": "55.705365693215",	//Example
			"latitud": "13.169667720795"	//Example
		},
		"exraid": false				//Example
	},
	.........
];
```
### Make Geofence
This is not a must if the page is run for a smaller city, but if it is running in a larger city, it may be useful for users to filter the posts. In order for this to work, the city must be divided into areas. The code uses Geofence to tag the posts for which areas the gym belongs to.

The easiest way to get the geofence coordinates is to go to [GeoFenceGenerator](https://codepen.io/jennerpalacios/full/mWWVeJ).

Change "/public/script/geofence.json" to your areas and coordinates, with folowing structure:
```
[
	{
		"tagg": "[id of tagg, only "a-z" and small letters, no spaces]",
		"rubrik": "[name of the tagg that your users will see]",
		"coord": [[longitude,latitude], ..... ]
	},{
		"tagg": "valkarra",						//Example
		"rubrik": "Valkärra",						//Example
		"coord": [[55.74731139809886,13.180714405888466], ..... ]	//Example
	},
	............
]
```

## How to run
1. Open Terminal or Command Prompt.
2. If you havent already: Download and install "npm" and "Node.js".
[https://nodejs.org/en/](https://nodejs.org/en/ "Install npm and Node.js")
3. Go to folder where you want to download and install in.
```
cd [rootlink to folder]
```
4. Download respetory
```
git clone https://github.com/teddykladdkak/raid-message.git
```
5. Go into the "Raid Message" folder.
```
cd [rootlink to folder & "raid-message/"]
```
6. Uppdate all the code.
```javascript
npm i
```
7. Start the server.
```javascript
node .
```
8. Choose and type admin password, enter to add.
9. Use one of the links as shown

## Todo
* Test and debug image to text.
* Load all files from server.. (After debug)
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
* 2/9 ~~Clean "raids.json" at the days end.~~
* 2/9 ~~Allows users to see who said they are coming.~~
* 2/9 ~~Allow users to change that they are not coming.~~
* 3/9 ~~Make setting for users to only show gyms in a specific area.~~
* 4/9 ~~Disable notifications.~~
* 4/9 ~~In settings allow users to turn off or turn on notifications.~~
* 4/9 ~~Only notifications from selected areas.~~
* 4/9 ~~Only load posts from selected areas.~~
* 4/9 ~~Stability in image API.~~
* 4/9 ~~"Image to text" function will restart and change contrast until it finds a match or reach max desaturation.~~
* 4/9 ~~All areas in Lund is now mapped to geofence. Loaded on clientside on start.~~