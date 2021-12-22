let myData = {};
let role;
let gameID;
let gameStatus = {};
let numClicks = 0;

// WebSocket
const socketProtocol = (window.location.protocol === 'https:' ? 'wss:' : 'ws:')
const portInfo = (window.location.port != 80 && window.location.port != 443 ? ":" + window.location.port  : '')
const socketUrl = socketProtocol + '//' + window.location.hostname + portInfo + '/socket/'
let webSocket = new WebSocket(socketUrl)

function sendToWs(action, data) { //sends data to WS. action: String, data: anything
  webSocket.send(JSON.stringify({action, data, gameID})); // adds a gameID with the data too!
}

webSocket.onmessage = function(event) {
  console.log(event);
  console.log(event.data);
  console.log(JSON.parse(event.data));

  let webSocketResponse = JSON.parse(event.data)[0];

  if (webSocketResponse.messageType === 'headerText') {
    updateHiderSeekerMessage(webSocketResponse.message);
  }
  else if (webSocketResponse.messageType === 'roleAssignment') { 
    // need to parse role and gameID from this message
    let messages = webSocketResponse.message.split('⚉⚯〄') //obscure emjoi string to seperate these!
    role = messages[0]
    gameID = messages[1]
  }
  else if (webSocketResponse.messageType === 'gameStatus') {
    updateGameStatus(webSocketResponse.message);
  }
  else if (webSocketResponse.messageType === 'seekerGuess') {
    updateHiderOnSeeker(webSocketResponse.message)
  }
  else if (webSocketResponse.messageType === 'sendSeekerUpdateToAll') {
    updateHiderSeekerMessage(webSocketResponse.message);
  } else if (webSocketResponse.messageType === 'endGameTexts') {
    console.log("ENDING TEXT FOr PERSON")
    console.log(webSocketResponse.message)
    updateHiderSeekerMessage(webSocketResponse.message.topText)
    updateGameStatusText(webSocketResponse.message.bottomText)
  }
}
 
async function updateHiderOnSeeker(wsData) {
  console.log('seeker guessed: ', wsData.buildingName)
  
  let coordinatesObject = await getCenterBuildingAPI(wsData.buildingName);
  console.log(coordinatesObject.x + " and ", coordinatesObject.y)
  
  // place green? dot
  // TODO: FIX THIS IT IS CURRENTLY COMMENTED OUT BC IT CAUSES HIDER DOTS TO NOT APPEAR FOR SEEKER
  //  if (!gameStatus.gameText.includes("in time")) {
     console.log("in game status game text")
    placeDot(coordinatesObject.x, coordinatesObject.y, wsData.seekerColor, 'hider');
  //  }
}

function setUserInputs() {
  myData.first_name = document.getElementById("username").value;
  if (myData.first_name !== '') {
    document.getElementById("hiThere").innerHTML = "Hi " + myData.first_name + "!"

    myData.color = document.getElementById("colorIcon").value
    sendToWs('setPlayerName', {
      name: myData.first_name, 
      color: myData.color
    })
    // hides input value once person has joined game
    document.getElementById("starterLogic").style.display = "none" 
  } else {
    alert('you forgot to tell us your name')
  }
}

async function mapClicked() {
  if(role == 'hider')
    hiderClicked();
  if(role == 'seeker')
    seekerClicked();
}

async function hiderClicked() {
  if (role == 'hider' && gameStatus.currentTurn == 'hider') {
    let buildingSelected = await getMouseInfo();

    if (buildingSelected) {
      hiderSelectedBuilding(buildingSelected.buildingName);
    }
  }
}

async function seekerClicked() {
  if (role == 'seeker' && gameStatus.currentTurn == 'seeker') {
    let selectedBuilding = await getMouseInfo();
    
    if (selectedBuilding) {
      numClicks++;
      // ask which buildling was selected 
      sendToWs('setSeekerLocation', selectedBuilding.buildingName)
      let comparedDistance = await compareBuildingAndGetDistanceAPI(selectedBuilding.buildingName, gameID);

      if (comparedDistance === 0) { // seeker found hider
        sendToWs('seekerWin', '');
      }
      else { 
        if (numClicks < 6) {
          updateGameStatusText("You are " + comparedDistance + "ft from the hider");
        } else {
          sendToWs('seekerLose', '');
          role = 'dead'
        }
      }
    }
  }
}

function hiderSelectedBuilding(buildingName) {
  console.log('Sending ' + buildingName + " to database");
  sendToWs('setHiderLocation', buildingName)

  updateGameStatusText("Hider has chosen hiding place, it is seeker's turn to seek")
}

function updateGameStatus(currentGameStatus) {
  updateGameStatusText(currentGameStatus.gameText);
  gameStatus.currentTurn = currentGameStatus.currentTurn;
}

function goToLeaderBoard(){
  location.href = '/leaderboard';
}