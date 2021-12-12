// placing dot on map
function placeDot(x, y, color, player) {
    document.getElementById("image").innerHTML += `<div class="point" style="
                                                    top:${y-5}px; 
                                                    left: ${x-5}px; 
                                                    background-color: ${color};
                                                    ${player == 'hider' ? `border: purple 2px solid` : ``}
                                                    "></div>`;
}

// right image bar text
function clickedTextInfo(posX, posY, adjustedX, adjustedY, buildingName) {
    document.getElementById("result").innerHTML = `<strong>Real Coordinates:</strong><br>
      X: ${posX}, Y: ${posY}<br><br>
      <strong>Adjusted Coordinates:</strong><br>
      X: ${adjustedX}, Y: ${adjustedY}<br>
      
      <strong>Building Name:</strong><br>
      ${buildingName}`;
  
    placeDot(adjustedX, adjustedY, myData.color, 'seeker');
}
  
// update hider seeker text field
function updateHiderSeekerMessage(message) {
    let hiderSeekerElement = document.getElementById('hider-seeker');
    hiderSeekerElement.innerHTML = message;
}

// update gameStatus text field
function updateGameStatusText(text) {
    let gameStatusElement = document.getElementById('game-status');
    gameStatusElement.innerHTML = text;
}

// waving hand animation on top of page
function waveOnLoad() { 
    const hand = document.querySelector('.emoji.wave-hand');
  
    hand.classList.add('wave');
    setTimeout(function() {
      hand.classList.remove('wave');
    }, 2000);
    
    setTimeout(function() {
      waveOnLoad();
    }, 1000);
  
    hand.addEventListener('mouseover', function() {
      hand.classList.add('wave');
    });
  
    hand.addEventListener('mouseout', function() {
      hand.classList.remove('wave');
    });
}