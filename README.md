# HIDE AND GEEK
A game to help you discover the UW Campus with a fun leaderboard! Built using websockets, APIs, and some database calls. Created with [Bradley Knorr](https://github.com/IamSuperB4), [Connor Voelk](https://github.com/connorvoelk), and [Lauren Ng](https://github.com/laurenng).

## Game Instructions
1. Open up https://www.hideandseekuw.me, input your name, and optionally, pick a color! <br>
2. Open up another https://www.hideandseekuw.me, input your name, and optionally pick a color! <br>
3. Assigning for a hider and seeker happens randomly. <br>
4. If you are the hider, please choose a *building* on the UW Campus to hide in. This includes buildings like Suzzallo Library, Mary Gates Hall, Odegaard Undergraduate Library. (Remember, areas like red square are not buildings!) <br>
5. The seeker should now be able to guess spots around campus to find the hider, and the match is over after 6 tries

### Note: <br> 
1. Do not close your socket in the middle of the game. This means you forfeit the match and the other player wins the game. <br>
buildings in it. Some of them include: Suzzallo Library, Mary Gates Hall, Odegaard Undergraduate Library, Kane Hall, Smith Hall, Burke Museum, Nanoengineering and Sciences Building and Meany Hall. <br>

## Project description
The project our team has decided to work on is a virtual hide and seek game on the UW  campus. Most UW students (freshmen - juniors, first year - third year graduate students) are having their first in-person classes, and as a result, tend to get lost and do not know where most buildings are. An online activity that promotes learning about UW geography, without having to spend hours wandering around the campus would be an efficient way to become acquainted with the campus. An activity like this could be used by individual students who would find the activity fun, first year and transfer students and programs that support them (like FIGs) and upperclassmen of UW that want to show off their trivia skills they have accumulated through schlepping to class for years. Through an application that’s never been built before for the UW campus, this could be their opportunity to learn more about how the campus is structured and where buildings are in a gamified manner. Because of this game’s fun and easy-to-play nature it can additionally serve as a fun way for students or prospective applicants to interact with their friends. 
<br>
This project excites us because as developers, we want to be able to give people effective solutions to their problems, which motivated us to create this application. We don’t have much experience with building applications with gamifications added to it, so it would be a challenging way for us to apply our new server-side knowledge and improve our existing web interaction skills. Concepts and skills from this class will allow us to centrally manage games from the server, while we can rely on our existing knowledge to present the game to the client. This game does not require intense imaging engines or use of anything we do not already have some understanding of, which is why it is a great way for us to expand our learnings in class while feeling confident we can complete the project.

## Technical description
### Architectural diagram
![public\images\archidiagram](public/images/archidiagram.png)
Note: Our updated plan uses websockets to accomplish networking, this is reflected in our table below, but not in this diagram because the behaviour remains the same, but with a websocket handling in action with “if/else”s instead of routes.
 
### Summary Table with User Stories
| Priority | User               | Description                                                                                                                                                                | Technical Implementation                                                                                                                                                                                      |
|----------|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Priority | User               | Description                                                                                                                                                                | Technical Implementation                                                                                                                                                                                      |
| P0       | As a user          | I want to get to the landing page (similar to agar.io) where to put in my username and begin playing                                                                       | Log/store the users name onto a mongoDB cluster, have an endpoint in our code to ensure we log this username.                                                                                                 |
| P0       | As a user          | I want to be able to play a virtual game of hide and seek on UW Campus.                                                                                                    | Log what a user is (hider or seeker) in mongoDB cluster, ensure that we receive/log coordinates when a user clicks a point using an endpoint to begin a hide and seek game.                                   |
| P0       | As a user          | I want there to be two players, one for hiding and seeking.                                                                                                                | Store a user’s hiding location in a mongoDB cluster and alternate their turns to guess each others.                                                                                                           |
| P0       | As a user (seeker) | I want to know how far away I am from the hider I’m looking for.                                                                                                           | Use the distance formula to determine how far the hider’s location is (stored in the database) from where the seeker clicked.                                                                                 |
| P1       | As a user          | I want there to be multiple hiders multiple seekers                                                                                                                        | Iterating on 1 hider, 1 seeker, we expand the game and have multiple lists to keep track of the locations.                                                                                                    |
| P1       | As a user (hider)  | I want to see markers locate where people are seeking, similar to battleship                                                                                               | Create a visual indicator for each seeker on the UI. We hope to use d3.js to get the animations of markers moving                                                                                             |
| P1       | As a user (seeker) | I want to see image hints on where the person can be, so that we can introduce competitive advantages of knowing the seeker territory.                                     | Display an image of a UW building to the user of where the hider(s) is. Would need to ‘send’ the response to display multiple images. Probably do not need to use a database for this.                        |
| P2       | As a user          | I want to have my own private room to play my game with only my friends.                                                                                                   | Encapsulate everything in one room object by generating a room code.                                                                                                                                          |
| P3       | As a user          | To be able to physically go around UW campus and set my hiding location. Then we (everyone playing the game) can get together to seek for each other and where they went.  | This is a very big stretch goal, but we would probably need a mongoDB cluster to store a username, location, and image sent by user. Would then use all of this information to plug into our current program. |

### WebSocket Actions for P0:
| Action Name      | Data Included                 | Description                                                                                                                                                          |
|------------------|-------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| setHiderLocation | Hider, XLocation, YLocation   | User posts their hiding location, gets uploaded to mongoDB. Will check if user’s location is in a building and will result in an error and a prompt to retry if not. |
| getHiderLocation | hiderID                       | To get the hiders location when seeker is looking                                                                                                                    |
| addPlayer        | userID, marker icon           | To add player to the list                                                                                                                                            |
| getPlayers       |                               | Gets full list of players                                                                                                                                            |
| addGuessLocation | seekerID, postionX, positionY | To add the seeker’s latest guess for where the hider is hiding                                                                                                       |
| getGuessLocation | seekerID                      | Get full list of guessed seeker locations                                                                                                                            |
| getHint          | positionX, positionY          | Gets hint image for hider’s location                                                                                                                                 |
