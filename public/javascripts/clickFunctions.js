// identifying width of the image 
function getWidth() {
    return Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    );
}

// calculating how much the user has scrolled to ensure our image coordinates are accurate
function getScrollHeight() {
    return scrollTop = window.pageYOffset || (document.documentElement || document.body.parentNode || document.body).scrollTop
}

// calculating how much the user has scrolled horizontally to ensure our image coordinates are accurate
function getScrollWidth() {
  return scrollLeft = window.pageXOffset || (document.documentElement || document.body.parentNode || document.body).scrollLeft
}

// getting mouse information from user click
async function getMouseInfo() {
    let e = window.event;
    let welcomeMessageHeight = document.getElementById("welcome-message").clientHeight + 
      document.getElementById("header").clientHeight;
    
    let imageWidth = 1000;
    let imageHeight = 666;
    let scrollHeight = getScrollHeight();
    let scrollWidth = getScrollWidth();
  
    let posX = e.clientX;
    let posY = e.clientY;
  
    let adjustedX = Math.round(posX - 100 + Math.ceil(scrollWidth));
    let adjustedY = Math.round(posY - 32 - welcomeMessageHeight + Math.ceil(scrollHeight));
  
    if(adjustedX >= 0 && adjustedX <= imageWidth 
    && adjustedY >= 0 && adjustedY <= imageHeight) {
      let buildingName = await getBuildingsAPI(adjustedX, adjustedY);
      
      // send to websocket
      if(buildingName !== 'You did not click on a valid building') {
        clickedTextInfo(posX, posY, adjustedX, adjustedY, buildingName);
  
        // might not need to return all? might need all? 
        return {
          adjustedX: adjustedX,
          adjustedY: adjustedY,
          buildingName: buildingName
        };
      }
      else {
        console.log('You did not click on a valid building');
        return null; 
      }
    }
  }