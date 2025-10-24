//Classes
  //Cookie handler for saving scores after closing game
class CookieHandler{
    constructor(){
        this.caches=new Map()
    }
    setCookie(varKey, val,expDays=7,toCache=true){
        const d=new Date()
        d.setTime(d.getTime()+this.toMs(expDays))
        document.cookie=`${varKey}=${val}; expires=${d.toUTCString()}; path=/`
        if(toCache) this.caches.set(varKey,val)
    }
    getCookie(varKey, toCache=false){
        let cookies=decodeURIComponent(document.cookie).split(";")
        for(let cookie of cookies){
            let ci=cookie.indexOf(varKey)
            if(ci==-1) continue
            let cval=cookie.substring(ci+1+varKey.length,cookie.length)
            if(toCache) this.caches.set(varKey,cval)
            return cval
        }
        if(toCache) this.caches.set(varKey,null)
        return null
    }
    getCache(varKey){
        return this.caches.get(varKey)
    }
    toMs(days){
        return days*24*60*60*1000
    }
    initCookies(varKeys){
        for(let varKey of varKeys){
            this.getCookie(varKey,true)
        }
    }
}
  //Move for saving move type and pos
class Move{
 constructor(x,y,type){
   this.x=x
   this.y=y
   this.type=type
 }
 static elem=null
 static color=null
}

//global elements
const Bking = document.getElementById("Bking")
const damasfx=document.querySelector("#sfx")
const deatsfx=document.querySelector("#death")
const damaGrid=document.querySelector(".dama-container")
const blackScoreElem = document.getElementById("blackScore")
const whiteScoreElem = document.getElementById("whiteScore")
const restartBtn = document.getElementById("restartBtn")
const winnerModal = document.getElementById("winnerModal");
const winnerText = document.getElementById("winnerText");
const closeWinnerBtn = document.getElementById("closeWinnerBtn");
const victoryMusic = document.getElementById("victoryMusic");
const music = document.getElementById("music");
const musicSelect = document.getElementById("musicSelect");
const musicMute = document.getElementById("musicMute");
const musicVolume = document.getElementById("musicVolume");

//global constants
const WIDTH=8
const HEIGHT=8
const CW=damaGrid.querySelector(".con").offsetWidth
const CH=damaGrid.querySelector(".con").offsetHeight
const colors= ["black","white"]
const musicTracks = [
  "8bit1.mp3",
  "8bit2.mp3",
  "8bit3.mp3",
  "8bit4.mp3",
  "8bit5.mp3",
  "8bit6.mp3",
  "8bit7.mp3",
  "8bit8.mp3",
  "8bit9.mp3"
];

//global variables
var locked=false
var turnOf=0;
var highlights=[]
var blackScore = 0;
var whiteScore = 0;
var currentTrackIndex = 0;
var isMuted = false;
var cHandler=new CookieHandler()
var repCount=0

//init events
restartBtn.addEventListener("click",() =>resetGame())
closeWinnerBtn.addEventListener("click", () => winnerModal.classList.remove("active"))
musicVolume.addEventListener("input", () => music.volume = musicVolume.value);
musicMute.addEventListener("click", () => {
  music.muted = !music.muted;
  isMuted = music.muted;
  musicMute.innerHTML = isMuted
    ? '<i class="ri-volume-mute-fill"></i>'
    : '<i class="ri-volume-up-fill"></i>';
});
// ======== select ========
musicSelect.addEventListener("change", () => {
  const selectedSrc = musicSelect.value;
  currentTrackIndex = musicTracks.indexOf(selectedSrc);
  if (currentTrackIndex === -1) currentTrackIndex = 0;
  music.src = musicTracks[currentTrackIndex];
  music.play();
});
// ======== volume on load ========
window.addEventListener("DOMContentLoaded", () => {
  musicVolume.value = 0.5;
  music.volume = 0.5;
  music.muted = false;
  currentTrackIndex = 0;
  music.src = musicTracks[currentTrackIndex];
  music.play();
});
// ======== play next track and loop ========
music.addEventListener("ended", () => {
  currentTrackIndex = (currentTrackIndex + 1) % musicTracks.length;
  music.src = musicTracks[currentTrackIndex];
  musicSelect.value = musicTracks[currentTrackIndex];
  music.play();
});

//Functions
//Reset Game State and Pieces
function resetGame(){
  removeHighlights()
  document.body.style.backgroundColor=colors[0]
  damaGrid.querySelectorAll(".piece").forEach(piece => piece.remove());
  turnOf = 0;
  locked = false;
  highlights = [];
  Move.elem = null;
  Move.color = null;
  let inEoO=0;
  for(let i=0;i<8;i++){
    if(i==3){
      i+=2
    }
    for(let j=inEoO;j<8;j+=2){
      let piece=createPiece()
      let color=(i<3)? colors[1]:colors[0]
      piece.x=j
      piece.y=i
      piece.color=color
      piece.classList.add(color)
      piece.isKing=false
      piece.classList.add("piece")
      let des=document.createElement("div")
      des.classList.add("design")
      piece.appendChild(des)
      piece.addEventListener("click",e=>{
        if(colors.indexOf(e.target.color)!=turnOf||locked) return
        damasfx.currentTime=0.5
        damasfx.play()
        removeHighlights()
        Move.elem=e.target
        Move.color=e.target.color
        Move.elem.classList.remove(Move.color);
        Move.elem.classList.add("highlighted")
        initMoves(e.target)
      })
      damaGrid.querySelectorAll(".con")[i*8+j%8].appendChild(piece)
    }
    inEoO=(inEoO+1)%2
  }
}

function createPiece(){
  let piece=document.createElement("div")
  piece.classList.add("piece")
  return piece
}

//function to validate movement for a piece
function move(dx,dy,elem){
  let x=dx+elem.x
  let y=dy+elem.y
  if(x>=WIDTH||x<0||y>=HEIGHT||y<0){
    return -1
  }
  let con= damaGrid.querySelectorAll(".con")[y*WIDTH+x]
  let piece=con.querySelector(".piece")
  if(piece==null){
    return new Move(x,y,0)
  }else if(piece.color!=Move.color){
    return attack(dx,dy,elem)
  }
}

//if a move is validated as an attack it runs this as well
function attack(dx,dy,elem){
  let x=2*dx+elem.x
  let y=2*dy+elem.y
  if(x>=WIDTH||x<0||y>=HEIGHT||y<0){
    return -1
  }
  let con=damaGrid.querySelectorAll(".con")[y*WIDTH+x]
  let piece=con.querySelector(".piece");
  if(piece==null){
    let attMove=new Move(x,y,1)
    x=dx+elem.x
    y=dy+elem.y
    let conAtt=damaGrid.querySelectorAll(".con")[y*WIDTH+x]
    let pieceAtt=conAtt.querySelector(".piece");
    attMove.attPiece=pieceAtt
    return attMove
  }
  return -1
}

//Init available moves to highlight
function initMoves(piece,removeNonAtt){
 let x=piece.x
 let y=piece.y
 let color=piece.color
 if(colors.indexOf(color)==0||piece.isKing){3
   highlights[highlights.length]=move(1,-1,piece)
   highlights[highlights.length]=move(-1,-1,piece)
 }
 if(colors.indexOf(color)==1||piece.isKing){
   highlights[highlights.length]=move(1,1,piece)
   highlights[highlights.length]=move(-1,1,piece)
 }
 if(removeNonAtt!=null) removeNonAttacks()
 initHighlights()
}

//Init highlights as well as click events
function initHighlights() {
  for (let move of highlights) {
    if (move == -1 || move == null) continue
    let highlight = document.createElement("div")
    highlight.classList.add("highlight")
    highlight.move = move
    if (move.type == 0) {
      highlight.addEventListener("click", e => {
        let move = e.target.move
        let con = damaGrid.querySelectorAll(".con")[move.y * WIDTH + move.x]
        let elem = Move.elem
        elem.x = move.x
        elem.y = move.y
        removeHighlights()
        checkKing(elem)
        turnOf = (turnOf + 1) % 2
        document.body.style.backgroundColor=colors[turnOf]
        con.appendChild(elem)
        repCount++
        if(repCount==30) resetGame()
        checkWinner()
      })
      let con = damaGrid.querySelectorAll(".con")[move.y * WIDTH + move.x]
      con.appendChild(highlight)
    } else if (move.type == 1) {
      highlight.addEventListener("click", e => {
        sfx.volume = 1
        sfx.currentTime = 0
        sfx.play()
        let move = e.target.move
        let con = damaGrid.querySelectorAll(".con")[move.y * WIDTH + move.x]
        let elem = Move.elem
        elem.x = move.x
        elem.y = move.y
        let capturedPiece = move.attPiece
        let con2 = damaGrid.querySelectorAll(".con")[capturedPiece.y * WIDTH + capturedPiece.x]
        if (capturedPiece.classList.contains("king")) {
          take.currentTime = 0
          take.volume = 1
          take.play()
        }
        con2.removeChild(con2.childNodes[0])
        //==================== Update score ====================
        if (elem.color === "black") {
          blackScore++;
        } else {
          whiteScore++;
        }
        updateScores();
        removeHighlights();
        initMoves(elem, true);
        if (hasAttack()) {
          con.appendChild(elem);
          elem.classList.add("highlighted");
          locked = true;
          sfx.currentTime = 0;
          sfx.play();
          return;
        }
        removeHighlights();
        locked = false;
        checkKing(elem);
        con.appendChild(elem);
        turnOf = (turnOf + 1) % 2;
        document.body.style.backgroundColor=colors[turnOf]
        repCount=0
        checkWinner();
      });
      let con = damaGrid.querySelectorAll(".con")[move.y * WIDTH + move.x];
      con.appendChild(highlight);
    }
  }
}

//For combo specific moves removes non attacks highlights
function removeNonAttacks(){
 highlights=highlights.map((e)=>{
   if(e==null||e==-1||e.type!=1) return null
   return e
 })
}

//checks if a combo is possible
function hasAttack(){
 for(let move of highlights){
   if(move==null||move==-1) continue
   if(move.type==1) return true
 }
 return false
}

//checks if piece promoted to a rank
function checkKing(elem){
  if(elem.isKing) return
  let targRank=(elem.color==colors[1])? HEIGHT-1:0;
  if(elem.y!=targRank) return
  elem.classList.add("king")
  let kicon=document.createElement("p")
  kicon.classList.add('ri-vip-crown-line')
  kicon.classList.add('king-icon')
  kicon.addEventListener("click",e=>elem.click())
  elem.appendChild(kicon)
  elem.isKing=true
  Bking.currentTime = 0;
  Bking.volume = 1;
  Bking.play();
}

//Removes highlights after a move or a different piece is picked
function removeHighlights(){
  if (Move.elem!=null) {
    Move.elem.classList.remove("highlighted")
    Move.elem.classList.add(Move.color)
  }
  for(let move of highlights){
    if(move==-1||move==null) continue
    let con=damaGrid.querySelectorAll(".con")[move.y*WIDTH+move.x]
    let hl=con.querySelector(".highlight")
    con.removeChild(con.childNodes[0])
  }
  highlights=[]
}

function updateScores() {
  blackScoreElem.textContent = blackScore;
  whiteScoreElem.textContent = whiteScore;
  cHandler.setCookie("P1Score",blackScore)
  cHandler.setCookie("P2Score",whiteScore)
}
function checkWinner() {
  const pieces = damaGrid.querySelectorAll(".piece");
  let blackCount = 0, whiteCount = 0;
  pieces.forEach(piece => {
    if (piece.color === "black") {
      blackCount++;
    } else if (piece.color === "white") {
      whiteCount++;
    }
  });
  if (blackCount === 0) {
    winnerText.textContent = "White wins!";
    winnerModal.classList.add("active");
    victoryMusic.play();
    winnerModal.classList.add("white-win");
  } else if (whiteCount === 0) {
    winnerText.textContent = "Black wins!";
    winnerModal.classList.add("active");
    victoryMusic.play();
    winnerModal.classList.remove("white-win");
  }
}

//experiment with cookies
var keys=["Name","Age","Nationality"]
cHandler.initCookies(keys)
function sampleCookies(){
  keys.forEach(key=>{
    console.log(cHandler.getCache(key))
  })
  cHandler.setCookie(keys[0],"Justin")
  cHandler.setCookie(keys[1],20)
  cHandler.setCookie(keys[2],"Filipino")
}

//retaining prev scores from cookies
function initScores(){
  cHandler.initCookies(["P1Score","P2Score"])
  blackScore=parseInt(cHandler.getCache("P1Score"))
  whiteScore=parseInt(cHandler.getCache("P2Score"))
  updateScores()
}

//Calls
resetGame()
initScores()
sampleCookies()
updateScores()