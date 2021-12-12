
async function getBuildingsAPI(adjustedX, adjustedY) {
      try {
          let response = await fetch(`building?cursorx=${adjustedX}&cursory=${adjustedY}`);
          let responseText = await response.text();
          return responseText;
      }
      catch(error){
          return {
              status: "error",
              error: "There was an error: " + error
          };
      }
  }

  async function compareBuildingAndGetDistanceAPI(seekerBuilding, gameID) {
    try {

        let response = await fetch(`compareBuildingDistance?seekBuilding=${seekerBuilding}&gameID=${gameID}`);
        let responseText = await response.json();
        return responseText.distance;
    }
    catch(error){
        return {
            status: "error",
            error: "There was an error: " + error
        };
    }
  }
  
  async function getCenterBuildingAPI(building) {
    try {
        let response = await fetch(`centerBuilding?building=${building}`);
        let responseJson = await response.json();
        console.log(responseJson);
        return responseJson;
    }
    catch(error){
        return {
            status: "error",
            error: "There was an error: " + error
        };
    }
  }
  async function getBuildingTargetAPI(buildingName) {
      try {
          let response = await fetch(`buildingTarget?name=${buildingName}`);
          let responseText = await response.json();
          return responseText;
      }
      catch(error){
          return {
              status: "error",
              error: "There was an error in BuildingTargetAPI Function: " + error
          };
      }
  }
  
  async function getDistanceAPI(X1, Y1, X2, Y2) {
    try{
        let response = await fetch(`distance?x1=${X1}&y1=${Y1}&x2=${X2}&y2=${Y2}`);
        let responseJson = await response.json();
        return responseJson;
    }
    catch(error){
        return {
            status: "error",
            error: "There was an error: " + error
        };
    }
  }
  