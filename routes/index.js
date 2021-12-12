// purpose of this file is to upload data into the database and make
// get calls
import mongoose from "mongoose";
import express from 'express';
import pointInPolygon from 'point-in-polygon'

import { getGameHiderBuilding } from './websocket.js';
//const game = require('./app.js')

var router = express.Router();

main().catch(err => console.log(err));

let Building
let Game
let INF = 10000

class Point
{
    constructor(x,y)
    {
        this.x = x;
        this.y = y;
    }
}

async function main() {
  await mongoose.connect(`mongodb+srv://jadedsouza:info441@cluster0.7hskm.mongodb.net/GeneralData`);

  const buildingSchema = new mongoose.Schema({
    name: String,
    symbol: String,
    LT_X: Number, 
    LT_Y: Number,
    RT_X: Number,
    RT_Y: Number,
    LB_X: Number,
    LB_Y: Number,
    RB_X: Number,
    RB_Y: Number,
    T_X: Number,
    T_Y: Number
  });
  Building = mongoose.model('uwbuildings', buildingSchema);

  const gameSchema = new mongoose.Schema({
    gameID: String,
    seekerUsername: String,
    hiderUsername: String, 
    hiderBuilding: String,
    seekerGuesses: [String],
    winner: String,
  });
  Game = mongoose.model('games', gameSchema);
}

// uploads game data into database
async  function uploadGameToDB(game){ 
  let gameID = game.hider.gameID
  let seekerUsername = game.seeker.username
  let hiderUsername = game.hider.username
  let hiderBuilding = game.hiderBuilding
  let seekerGuesses = game.seekerGuesses
  let winner = game.winner
  console.log('uploading game:', gameID, 'to mongo')
  let newGame = new Game({
    gameID,
    seekerUsername,
    hiderUsername,
    hiderBuilding,
    seekerGuesses,
    winner
  })

  let gameForDB = await newGame.save()
  console.log(gameForDB)
  //we can send a json saying status:success
}

// GETS Building Data 
router.get('/building', async function(req, res, next) {
  res.type("txt");
  try {
      let cursor = [req.query.cursorx, req.query.cursory]

      let allBuildings = await Building.find();

      let buildingJSON = await Promise.all(allBuildings.map(async (buildingInfo) => {
          return {
            Name: buildingInfo.name,
            Symbol: buildingInfo.symbol,
            LT_X: buildingInfo.LT_X, 
            LT_Y: buildingInfo.LT_Y,
            RT_X: buildingInfo.RT_X,
            RT_Y: buildingInfo.RT_Y,
            LB_X: buildingInfo.LB_X,
            LB_Y: buildingInfo.LB_Y,
            RB_X: buildingInfo.RB_X,
            RB_Y: buildingInfo.RB_Y
          };
      }));
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

  let targetBuilding = await Building.find({name: buildingName}).exec();

  res.json({
    x: targetBuilding[0].T_X, 
    y: targetBuilding[0].T_Y
  })
});

router.get('/centerBuilding', async function(req, res, next) {
  let buildingName = req.query.building;
  
  let targetBuilding = await Building.find({name: buildingName}).exec();
  
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

  let hidingBuildingObject = await Building.find({name: seekerSelectedBuildingName}).exec();
  let seekerSelectedBuildingObject = await Building.find({name: hidingBuildingName}).exec();

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

