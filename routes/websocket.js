import express from 'express';
import enableWs from 'express-ws'; 

import { uploadGameToDB } from './index.js'

var router = express.Router();

enableWs(router)

let userIndex = 1;
let clientQueue = [] // Queue for clients waiting to play (or become players)
let allWebSockets = [] // Collects information existing web sockets - should be phased out maybe...?
let games = {} // Dictionary for games {gameID: gameJSON}

// Web socket handler function
router.ws('/', function(ws, req) {
  const myIndex = userIndex; // take next index
  console.log('Socket connection attempted @', userIndex) // alert server
  let user = { // create userObject 
    socket: ws,
    wsIndex: myIndex,
    username: undefined, 
    color: undefined,
    gameID: undefined,
  };
  
  // add client to queue 
  clientQueue.push(user)
  console.log("Socket " + myIndex + " connected!");
  userIndex++;

  ws.on('message', function(msg) { // handle message headers from client
    const msgJson = JSON.parse(msg);
    console.log(msgJson.action)
    switch(msgJson.action) {
      case 'setPlayerName': // This is when a client is telling us they are ready to begin the game, by sending their username
        startGame(msgJson, myIndex); // TODO: add color
        break;
      case 'setHiderLocation': // This is when the Hider sets their location, prompting the seekers turns tro begin
        setHiderLocation(msgJson);
        break;
      case "setSeekerLocation": // This is when a Seeker makes a guess, prompting another try, or a win/lose scenario
        setSeekerLocation(msgJson); 
        break;
      case "seekerWin": // This is when the Seeker wins the game (guessed hider location in 5 tries)
        console.log('seeker won!')
        seekerWin(msgJson.gameID)
        break;
      case "seekerLose":
        seekerLose(msgJson.gameID)
        break;
      default: // This is when an unkown header is sent to the web socket
        console.log('UNKNOWN SWITCH:', msgJson.action)
    }
  });

  ws.on('close', () => {
      console.log('handles close')
      if(user.gameID){ // if the user is in a game
        const game = games[user.gameID] // get that game
        if(game){ // if that game is ongoing (exists).
          // delete them from game, and end that game.
          const game = games[user.gameID]
          if (!game.gameUploaded) {
          if(user.wsIndex === game.seeker.wsIndex){ // if the player is the seeker
            seekerLose(user.gameID)
          } else if(user.wsIndex === game.hider.wsIndex){ // if the player is the hider
            seekerWin(user.gameID)
          }
        } else { // if that game ended, already has a winner, lets end graceffuly
          console.log('MAYBE THERE DOESNT EVEN NEED TO BE ANYTHING HERE')
        }
      }
      } else { // if they were not in a game, they were in the queue
        debugClientQueue()
        removePlayerFromClientQueue([myIndex])// removes closed player from the queue, in case someone gets on and closes connection without playing
        debugClientQueue()
      }

  })
});

// HELPER FUNCTIONS
function startGame(msgJson, myIndex) {
    // add name to the user variable 

    console.log('CLIENT QUEUE AT START GAME')
    debugClientQueue()

    let myClient // Will be the client that we are dealing with in this instance
    clientQueue.forEach((client)=>{
        if(client.wsIndex===myIndex){ // if this is the droid we're looking for
            console.log('i found something')
            myClient = client
        }
    })
   if (myClient | myClient.username !== null) { // if I do not have a username 
        myClient.username = msgJson.data.name 
        myClient.color = msgJson.data.color
    }

    console.log('CLIENT QUEUE BEFORE GAME MAKING')
    debugClientQueue()

    let currentAvailablePlayers = availablePlayersInClientQueue()
    // console.log('I got currentAvailablePlayers:', currentAvailablePlayers)

    if (currentAvailablePlayers.length >= 2) { // If there are at least 2 players waiting(should be based on their username)
        // make a game with the first two people found in that array!
        let player1Index = currentAvailablePlayers[0]
        let player2Index = currentAvailablePlayers[1]
        console.log('making a game with '+clientQueue[player1Index].username+ ' and '+ clientQueue[player2Index].username)
        let player1 = clientQueue[player1Index]
        let player2 = clientQueue[player2Index]

        console.log('CLIENT QUEUE BEFORE REMOVAL')
        debugClientQueue()

        removePlayerFromClientQueue([player1.wsIndex, player2.wsIndex]) // remove these players from clientQueue

        console.log('CLIENT QUEUE AFTER REMOVAL')
        debugClientQueue()

        const gameID = player1.wsIndex + '-' + player2.wsIndex
        player1.gameID = gameID;
        player2.gameID = gameID;
        let newGame =  { // gameid to game player1ID-player2ID 
        seeker: player1, // TODO: Randomize
        hider: player2, 
        hiderBuilding: undefined, 
        seekerGuesses: [],
        numberOfGuesses: 0,
        gameStarted: false,
        winner: undefined,
        gameUploaded: false,
        }

        games[gameID] = newGame
        console.log("new game sucessfully created: ");
        //console.log(newGame);

        // send header updates to the players of the new game
        let hiderMessage = `You are the <u>Hider</u>. ${newGame.seeker.username} is the seeker, and will be looking for you`;
        let seekerMessage = `You are the <u>seeker</u> looking for ${newGame.hider.username}`;
        sendMessageToHider(gameID, 'headerText', hiderMessage);
        sendMessageToSeeker(gameID, 'headerText', seekerMessage);

        sendMessageToHider(gameID, 'roleAssignment', 'hider⚉⚯〄'+gameID); // assign 'hider' role to hider. ignore those weird emjois....
        sendMessageToSeeker(gameID, 'roleAssignment', 'seeker⚉⚯〄'+gameID); // assign 'seeker' role to seeker

        newGame.gameStarted = true; // game has started now!
        sendMessageToHider(gameID, 'gameStatus',{ // let the hider know to hide!
            gameText: 'You can now play. Please choose a building to hide in',
            currentTurn: 'hider'
        });

    } else { // there is only 1 player or there is a problem
      // tell player to wait for game in header text
      console.log('DEBUG: Are there two players waiting? If so you fucked up')
      myClient.socket.send(JSON.stringify(createWebSocketJson('headerText', 'You are in the queue, looking for players now...')))
      sendMessageToUsersInClientQueue('headerText', myClient.username + ' is looking for a friend to play with...', myClient.wsIndex);
    }
  }
  
  function seekerWin(gameID) {
    const game = games[gameID]
    game.winner = 'seeker';
    // yeah i get object object too. weird... 
    console.log(game)
    sendMessageToHider(gameID, 'endGameTexts', 
      {
        topText: 'You Lost :(',
        bottomText: `${game.seeker.username} found you. Pick a better hiding spot. Reload page to play again`
      })
    sendMessageToSeeker(gameID, 'endGameTexts', 
    { 
      topText: 'Winner!!', 
      bottomText: `Congrats dude, you found ${game.hider.username}! Reload page to play again`
    }); 
    endGame(gameID);
  }
  
  function seekerLose(gameID) {
    const game = games[gameID]
    game.winner = 'hider';

    sendMessageToHider(gameID, 'endGameTexts', 
      {
        topText: 'Winner!!',
        bottomText: `${game.seeker.username} couldn't find you in time! Reload page to play again`
      })
    sendMessageToSeeker(gameID, 'endGameTexts', 
    { 
      topText: 'You Lost :(', 
      bottomText: `${game.hider.username} was hiding in ${game.hiderBuilding}. Reload page to play again`
    }); 
    endGame(gameID);
  }
  
  function endGame(gameID) { 
    console.log('END GAME IS GETTING CALLED')
    const game = games[gameID]
    
    if(!game.gameUploaded){ // If game has not been uploaded
      uploadGameToDB(game) // send it to the database
    }
    game.gameUploaded = true
    console.log('end game'+ gameID)
    console.log(games)
  }
  
  function setHiderLocation(msgJson) {
    let game = games[msgJson.gameID]
    console.log('I am setting the hider location')
    // set the building and location for the player.
    game.hiderBuilding = msgJson.data
    //console.log(game)
    //send to the clients that this was set successfully
    sendMessageToSeeker(msgJson.gameID, 'gameStatus', 
    { 
      gameText: 'The hider has chosen a hiding spot. Go find them!',
      currentTurn: 'seeker'
    });
  
    sendMessageToHider(msgJson.gameID,'gameStatus', 
    { 
      gameText: 'You are hiding in '+game.hiderBuilding+', the seeker is trying to find you...',
      currentTurn: 'seeker'
    });
  }
  
  // important for hider to see where seeker is guessing
  function setSeekerLocation(msgJson) {
    let game = games[msgJson.gameID]
    game.seekerGuesses.push(msgJson.data);
    game.numberOfGuesses++;
    // let the hider know where the seeker is guessing!
    sendMessageToHider(msgJson.gameID, 'seekerGuess', {
      buildingName: msgJson.data,
      seekerColor: game.seeker.color 
    })
      sendMessageHiderAndSeeker(msgJson.gameID, 'sendSeekerUpdateToAll', 'Seeker is on turn: ' + game.numberOfGuesses + "/6");
  }
  
  function sendMessageToSeeker(gameID, messageType, message) {
    const game = games[gameID]
    if(game.seeker)
      game.seeker.socket.send(JSON.stringify(createWebSocketJson(messageType, message)));
  }
  
  function sendMessageToHider(gameID, messageType, message) {
    const game = games[gameID]
    if(game.hider)
    game.hider.socket.send(JSON.stringify(createWebSocketJson(messageType, message)));
  }
  
  function sendMessageHiderAndSeeker(gameID, messageType, message) {
    const game = games[gameID]
    if(game.hider)
    game.seeker.socket.send(JSON.stringify(createWebSocketJson(messageType, message)));
  
    if(game.seeker)
    game.hider.socket.send(JSON.stringify(createWebSocketJson(messageType, message)));
  }
  
  function sendMessageToUsersInClientQueue(messageType, message, except=undefiend) { // Sends to all users in the clientQueue, optional except option, takes in the wsIndex of that user
    console.log('I want to send a message, but not to:', except )
    clientQueue.forEach((client)=>{ 
        if(except && client.wsIndex !== except){ // if there is an except arg and they are not the exception
             client.socket.send(JSON.stringify(createWebSocketJson(messageType, message)))
        }
    })
  }
  
  function sendMessageToAllUsers(messageType, message) {
    for (const [socketNum, socketInfo] of Object.entries(allWebSockets)) { //sends data to all active sockets
      socketInfo.socket.send(JSON.stringify(createWebSocketJson(messageType, message)));
    }
  }
  
  function createWebSocketJson(messageType, message) {
    let jsonArray = [];
    let jsonElement = {messageType: messageType, message: message};
    jsonArray.push(jsonElement);
  
    return jsonArray;
  }
  
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

  // MIGHT NEED TO CAP AT 2
  function availablePlayersInClientQueue(){ // returns an array of players available to play
    console.log('finding available players...')
    let availablePlayers = []
    clientQueue.forEach((client, index)=>{
        if(client.username && !client.gameID){ // if username is defined (ready to play), but gameID is not (not in a game yet)
            console.log('found one!', client.username, client.gameID)
            availablePlayers.push(index) // put that player's clientQueue index in the array
        }
    })
    //console.log('found available players:', availablePlayers)
    return availablePlayers
  }

  function removePlayerFromClientQueue(wsIndicies){ // takes in array of wsIndex's to remove from the queue uses wsIndex because these will not change!
    clientQueue = clientQueue.filter((client)=>{
    //  !wsIndicies.includes(client.wsIndex) // COULD BE THIS ONE LINE!
        if(wsIndicies.includes(client.wsIndex)){
            console.log('I am deleting '+ client.wsIndex)
            return false // do not include
        }
        return true
     })
  }

  function getGameHiderBuilding(gameID){ // Returns the hider Building from the specified game
    console.log('the hiderBuilding is being requested for Game:', gameID)
    try{
        return games[gameID].hiderBuilding   
    } catch(error){ // probably will be the gameID isnt a real game or something like that!
        return ({status:'error', error})
    }
  }

  function debugClientQueue(){
    let currentCQ = 'CLIENT QUEUE: '
    clientQueue.forEach((client)=>{
      //console.log(client)
      currentCQ+='{'+ client.username + ', ' + client.wsIndex + '}, '
    })
    console.log(currentCQ)
  }

export {getGameHiderBuilding}
export default router