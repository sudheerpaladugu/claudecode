
#### Install claude-code
npm i -g @anthropic-ai/claude-code

mkdir -p cradiocalico && cd cradiocalico

type claude

##### you will get a promt to enter project description
Enter below prompt:
Install and configure a webserver and database we can use for locally prototyping a website we are going to build.


It will install nodejs, express, sqlite db etc along with the static content folders. index.html will be added with user and email.

#### save below prompt 
- # Our default webserver for development and testing purposes is Express.js. You can start it using npm start.

- # For the backend database, we are using SQLite and Flask

Enter below prompt:
 Start the webserver and tell me what page to hit to test it from browser.


exit from Claud and download a file
curl --location http://media.sundog-soft.com/Claude/RadioCalicoStyle.zip -o RadioCalicoStyle.zip

cat stream_URL.txt

https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8

(HLS) -> HTML Live Stream

Generate a webpage that embeds an online radio player capable of playing a lossless HLS stream at https://d3d4yli4hf5bmh.cloudfront.net/hls/live.m3u8


Create the HTML webpage with HLS radio player. Set up Express.js server to serve the webpage. Test the radio player
  functionality.
  
  Examine the output from the file metadatav2.json at the same host as the string

Add a "now playing" the widged that displays the current track information for the song currently playing, and a "recently played" widget that displays the 5 previously played tracks below it.

An image of the album art of the song currently playing is available at the same server, under conver.jpg. Integrate that album art into the "now playing" widget.

Add a feature to allow listeners to rate each song with a thumbs up / thumbs down rating, and display the total thumbs up and thumbs down ratings from all users. Do not allow a user to rate a song more than once.

Change this so that the user ID is consistent for a give browser based on their IP address or other presistent identifiers that are available without a login

Incorporate the IP address into the browser fingerprint

When I click on the thumb up or thumb down icon, the ratings displayed did not change. What is wrong?

New Song art is not changing in "Now Playing" widget. It is displaying 'album-art.npg' always.  What is wrong?

Adjust the styling of the site to incorporate the style guide at ~/radioclico/RadioCalico_Style_Guide.txt, and the logo PNG file found in the same directory.

# When starting the webserver, do not run "npm start" in the foreground, as that will block. Run it in the background if you must restart it. Also, assume that it is already running.

Refer to the screenshot of the ideal Radio Calicao layout at ~/radiocalico/RadioCalicoLayout.PNG, and modify the site to match it.

Layout is still not matching with ~/radiocalico/RadioCalicoLayout.PNG. what is wrong?

I am still seeing static content for the track title, album, and no recently playing titles are listed. It shows "Cool Cats"'s "Flashdance (Original Motion Picture Soundtrack)" from "Jazz Fusion" as playing all the time. Is that hardcoded and not being updated on the current data?

Update the layout to remove the year overlay on the album art.

Refractor the public index.html such that css styling is in its own separate file

