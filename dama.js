
   const Bking = document.getElementById("Bking")
   const damasfx=document.querySelector("#sfx")
   const deatsfx=document.querySelector("#death")
   const damaGrid=document.querySelector(".dama-container")
   const WIDTH=8
   const HEIGHT=8
   const CW=damaGrid.querySelector(".con").offsetWidth
   const CH=damaGrid.querySelector(".con").offsetHeight
   var locked=false
   var turnOf=0;
   var highlights=[]
   //==================== move types ====================
   // 0= move
   // 1= attack
   //for(let i=0;i<)
   class Move{
    constructor(x,y,type){
      this.x=x
      this.y=y
      this.type=type
    }
    static elem=null
    static color=null
   }
   function resetGame(){
    removeHighlights()
    document.body.style.backgroundColor=colors[0]
    damaGrid.querySelectorAll(".piece").forEach(piece => piece.remove());
    blackScore = 0;
    whiteScore = 0;
    updateScores();
    turnOf = 0;
    locked = false;
    highlights = [];
    Move.elem = null;
    Move.color = null;
    //==================== Recreate pieces ====================
    var inEoO=0;
    for(let i=0;i<8;i++){
      if(i==3){
        i+=2
      }
      for(let j=inEoO;j<8;j+=2){
        var piece=createPiece()
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
   let colors= ["black","white"];
   function createPiece(){
    var piece=document.createElement("div")
    piece.classList.add("piece")
    return piece
   }
   var inEoO=0;
   for(let i=0;i<8;i++){
    if(i==3){
      i+=2
    }
    for(let j=inEoO;j<8;j+=2){
      var piece=createPiece()
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
        damasfx.currentTime=1
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
    inEoO=(inEoO+1)%2;
   }
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
   function initHighlights() {
  for (let move of highlights) {
    if (move == -1 || move == null) continue;
    let highlight = document.createElement("div");
    highlight.classList.add("highlight");
    highlight.move = move;
    if (move.type == 0) {
      highlight.addEventListener("click", e => {
        let move = e.target.move;
        let con = damaGrid.querySelectorAll(".con")[move.y * WIDTH + move.x];
        let elem = Move.elem;
        elem.x = move.x;
        elem.y = move.y;
        removeHighlights();
        checkKing(elem)
        turnOf = (turnOf + 1) % 2
        document.body.style.backgroundColor=colors[turnOf]
        con.appendChild(elem);
        checkWinner();
      });
      let con = damaGrid.querySelectorAll(".con")[move.y * WIDTH + move.x];
      con.appendChild(highlight);
    } else if (move.type == 1) {
      highlight.addEventListener("click", e => {
        sfx.volume = 1;
        sfx.currentTime = 0;
        sfx.play();

        let move = e.target.move;
        let con = damaGrid.querySelectorAll(".con")[move.y * WIDTH + move.x];
        let elem = Move.elem;
        elem.x = move.x;
        elem.y = move.y;
        let capturedPiece = move.attPiece;
        let con2 = damaGrid.querySelectorAll(".con")[capturedPiece.y * WIDTH + capturedPiece.x];

        
        if (capturedPiece.classList.contains("king")) {
          take.currentTime = 0;
          take.volume = 1;
          take.play();
        }

        con2.removeChild(con2.childNodes[0]);
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
        checkWinner();
      });
      let con = damaGrid.querySelectorAll(".con")[move.y * WIDTH + move.x];
      con.appendChild(highlight);
    }
  }
}
   function removeNonAttacks(){
    console.log(highlights)
    highlights=highlights.map((e)=>{
      if(e==null||e==-1||e.type!=1) return null
      return e
    })
    console.log(highlights)
   }
   function hasAttack(){
    for(let move of highlights){
      if(move==null||move==-1) continue
      if(move.type==1) return true
    }
    return false
   }
   function checkKing(elem){
    if(elem.color==colors[0]){
      if(elem.y==0) {
        elem.classList.add("king")
        if(!elem.isKing) {
          elem.innerHTML+="<i class='ri-vip-crown-line' style='color:gold; font-size:23px; background-color: transparent'></i>"
          elem.isKing=true
          Bking.currentTime = 0;
          Bking.volume = 1;
          Bking.play();
        }
      }
    }else if(elem.color==colors[1]){
      if(elem.y==HEIGHT-1) {
        elem.classList.add("king")
        if(!elem.isKing) {
          elem.innerHTML+="<i class='ri-vip-crown-line' style='color:gold; font-size:23px; background-color: transparent'></i>"
          elem.isKing=true
          Bking.currentTime = 0;
          Bking.volume = 1;
          Bking.play();
        }
      }
    }
   }
   function removeHighlights(){
    if (Move.elem!=null) {
      Move.elem.classList.remove("highlighted")
      Move.elem.classList.add(Move.color)
    }
    for(let move of highlights){
      if(move==-1||move==null){
      continue
      }
      let con=damaGrid.querySelectorAll(".con")[move.y*WIDTH+move.x]
      let hl=con.querySelector(".highlight")
      con.removeChild(con.childNodes[0])
      }
      highlights=[]
  }

  let blackScore = 0;
  let whiteScore = 0;
  const blackScoreElem = document.getElementById("blackScore");
  const whiteScoreElem = document.getElementById("whiteScore");
  const restartBtn = document.getElementById("restartBtn");

  function updateScores() {
    blackScoreElem.textContent = blackScore;
    whiteScoreElem.textContent = whiteScore;
  }

  // Reset
  restartBtn.addEventListener("click", () => {
    resetGame()
  })
  const winnerModal = document.getElementById("winnerModal");
  const winnerText = document.getElementById("winnerText");
  const closeWinnerBtn = document.getElementById("closeWinnerBtn");
  const victoryMusic = document.getElementById("victoryMusic");

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

    closeWinnerBtn.addEventListener("click", () => {
      winnerModal.classList.remove("active");
    });

  const music = document.getElementById("music");
    const musicSelect = document.getElementById("musicSelect");
    const musicMute = document.getElementById("musicMute");
    const musicVolume = document.getElementById("musicVolume");
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
let currentTrackIndex = 0;
let isMuted = false;

musicMute.addEventListener("click", () => {
  music.muted = !music.muted;
  isMuted = music.muted;
  musicMute.innerHTML = isMuted
    ? '<i class="ri-volume-mute-fill"></i>'
    : '<i class="ri-volume-up-fill"></i>';
});

musicVolume.addEventListener("input", () => {
  music.volume = musicVolume.value;
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

  updateScores();

  



