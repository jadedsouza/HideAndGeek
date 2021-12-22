import express from 'express';
import path from 'path';

import { getGameData } from '../db.js'

const __dirname = path.resolve();
var router = express.Router();

// Sends the html file for leaderboards
router.get('/', function(req, res, next) {
  res.type('html')
  res.sendFile(path.join(__dirname, 'public/leaderboard.html'));
});

// sends some data accross
router.get('/data', async function(req, res, next) {
    res.type('json')
    let games = await getGameData()

    let seekerWins = {}
    games.forEach((game)=>{
        let seeker = game.seekerUsername // get the seeker
        if(game.winner === 'seeker'){ // if the seeker won
            if(seekerWins[seeker]){ // if this seeker exists
                seekerWins[seeker]++ // increase the count
            } else { // if seeker does not exist
                seekerWins[seeker] = 1 // make entry with 1 as value
            }
        }
    })

    let hiderWins = {}
    games.forEach((game)=>{
        let hider = game.hiderUsername // get the hider
        if(game.winner === 'hider'){ // if the hider won
            if(hiderWins[hider]){ // if this hider exists
                hiderWins[hider]++ // increase the count
            } else { // if hider does not exist
                hiderWins[hider] = 1 // make entry with 1 as value
            }
        }
    })

    let hidingSpots = {}
    games.forEach((game)=>{
        let building = game.hiderBuilding
        if(building){ // if building is not undefined, which can happen if a game starts and ends without picking a building
            if(hidingSpots[building]){ // if this building exists
                hidingSpots[building]++ // increase the count
            } else { // if building does not exist
                hidingSpots[building] = 1 // make entry with 1 as value
            }
        }
    })

    // combine the two wins
    let allWins = {...seekerWins} // set all wins equal to the seeker wins
    for (const winner in hiderWins) {
        if(winner in allWins){ // if this winner already exists
            allWins[winner] = allWins[winner] + hiderWins[winner] // increase the count by the hider wins
        } else { // if winner does not exist
            allWins[winner] = hiderWins[winner] // make entry equal to hider wins
        }
    }

    // Sort and cap it at top 5 for all of them!
    hidingSpots = sortAndCapResults(hidingSpots)
    allWins = sortAndCapResults(allWins)
    seekerWins = sortAndCapResults(seekerWins)
    hiderWins = sortAndCapResults(hiderWins)

    res.send({allWins, hidingSpots, seekerWins, hiderWins}) // send it off
    //res.send(games)
  });

function sortAndCapResults(result){
    // Create agnostic array of items
    var items = Object.keys(result).map(function(key) {
        return {name: key, count: result[key]};
    });

    // Sort the array based on the two neighboring elements
    items.sort(function(first, second) {
        return second.count - first.count;
    });

    // Create a new array with only the first 5 items (top 5)
    return(items.slice(0, 5))
}

export default router
