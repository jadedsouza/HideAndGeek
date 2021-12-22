
async function getGameDataAPI() {
    try {
        let response = await fetch(`leaderboard/data`);
        let responseText = await response.json();
        return responseText;
    }
    catch(error){
        return {
            status: "error",
            error: "There was an error: " + error
        };
    }
}


async function renderResults(){
    let data = await getGameDataAPI() //receive data

    // construct table bodies
    let allWinsBody = renderTableBody(data.allWins)
    let seekerWinsBody = renderTableBody(data.seekerWins)
    let hiderWinsBody = renderTableBody(data.hiderWins)
    let hidingSpotsBody = renderTableBody(data.hidingSpots)

    //construct table headers
    let winsHeader = 
        `<tr>
            <th>Username</th>
            <th>Wins</th>
        </tr>`
    let hidingSpotsHeader = 
        `<tr>
            <th>Building</th>
            <th>Times Used</th>
        </tr>`
    
    // populate in the DOM
    document.getElementById('wins-table').innerHTML = `<table>${winsHeader + allWinsBody}</table>`
    document.getElementById('hider-wins-table').innerHTML = `<table>${winsHeader}${hiderWinsBody}</table>`
    document.getElementById('seeker-wins-table').innerHTML = `<table>${winsHeader}${seekerWinsBody}</table>`
    document.getElementById('hiding-spot-table').innerHTML = `<table>${hidingSpotsHeader}${hidingSpotsBody}</table>`

}

function renderTableBody(data){
    let renderedBody = ''
    data.forEach(element => {
        let row = 
            `<tr>
                <td>${element.name}</td>
                <td>${element.count}</td>
            </tr>`
        renderedBody += row
    });
    return renderedBody
}

function goToGame(){
    location.href = '/';

}

renderResults()