// manages database interaction using mongoose. Exorts functions to be called by other backend files/endpoints.
import mongoose from "mongoose";

main().catch(err => console.log(err));

let Building
let Game

async function main() { // connects to database and creates schemas
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

async function uploadGameToDB(game){ //takes a game, and uploads the relevant data to the database
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

async function getBuildingJSON(){ // returns all buildings as an array of Objects
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
    return buildingJSON
}

async function getTargetBuilding(buildingName){ // returns a building of the given name in an array
    let targetBuilding = await Building.find({name: buildingName}).exec();
    return(targetBuilding)
}

async function getGameData(){
    let gameData = await Game.find();
    //let gameData = await gameRaw.json()
    return gameData
}   

export {uploadGameToDB, getBuildingJSON, getTargetBuilding, getGameData}