import express from 'express';
import pointInPolygon from 'point-in-polygon'

import {uploadGameToDB, getBuildingJSON, getTargetBuilding} from '../db.js'
import { getGameHiderBuilding } from './websocket.js';

var router = express.Router();

// GETS Building Data 
router.get('/building', async function(req, res, next) {
  res.type("txt");
  try {
      let cursor = [req.query.cursorx, req.query.cursory]

      let buildingJSON = await getBuildingJSON() // get buildings from db

      buildingJSON.forEach((building) => {
        let buildingPolygon = [[building.LT_X, building.LT_Y,],
                              [building.RT_X, building.RT_Y,],
                              [building.RB_X, building.RB_Y,],
                              [building.LB_X, building.LB_Y,]]
        if(pointInPolygon(cursor, buildingPolygon)){
          console.log("Found " + building.Name);
          res.send(building.Name);
          return;
        }
      })
    // if no building is found
    res.send("You did not click on a valid building");
  }
  catch (error) {
    console.log(error)
  }
});

router.get('/buildingTarget', async function(req, res, next) {
  let buildingName = req.query.name.toString();

  let targetBuilding = await getTargetBuilding(buildingName)

  res.json({
    x: targetBuilding[0].T_X, 
    y: targetBuilding[0].T_Y
  })
});

router.get('/centerBuilding', async function(req, res, next) {
  let buildingName = req.query.building;
  
  let targetBuilding = await getTargetBuilding(buildingName)
  
  res.json({
    x: targetBuilding[0].T_X, 
    y: targetBuilding[0].T_Y
  })
});


router.get('/compareBuildingDistance', async function(req, res, next) {
  let seekerSelectedBuildingName = req.query.seekBuilding.toString();
  let gameID = req.query.gameID.toString();
  
  //let response = await fetch(`/getTargetBuilding`);
  let hidingBuildingName = getGameHiderBuilding(gameID) //placeholder
  console.log('HIDING BUILDING: ', hidingBuildingName)

  //console.log(game.hiderBuilding);

  let hidingBuildingObject = await getTargetBuilding(seekerSelectedBuildingName)

  let seekerSelectedBuildingObject = await getTargetBuilding(hidingBuildingName)

  let distanceInPixels = calculateDistanceBetweenTwoBuildings(hidingBuildingObject[0], seekerSelectedBuildingObject[0]);
  let distanceInFeet = pixelsToFeet(distanceInPixels);
  console.log('distance', distanceInFeet)

  res.send(JSON.stringify({distance: distanceInFeet}));
});

function pixelsToFeet(distanceInPixels) {
  let distanceInFeet = ((5280/4)/150)*distanceInPixels; // 1/4 mile = 150 pixels
  return Math.ceil(distanceInFeet/50)*50; // round up to nearest 50 feet
}

function calculateDistanceBetweenTwoBuildings(hidingBuilding, seekerSelectedBuilding) {
  let x1 = hidingBuilding.T_X;
  let y1 = hidingBuilding.T_Y;
  let x2 = seekerSelectedBuilding.T_X;
  let y2 = seekerSelectedBuilding.T_Y;

  // pythagoras theorem
  let a = x1 - x2;
  let b = y1 - y2;
  let distance = Math.sqrt( a*a + b*b );

  return distance;
}

export {uploadGameToDB}
export default router

