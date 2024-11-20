let gridSize
let level = []
let body = document.getElementById("body")
let dropDown = document.getElementById("levelElement")
let element = "erase"
let selected
let camera
let reset = document.getElementById("reset")
let input = []
let speed = document.getElementById("scrollSpeed")
let viewReset = document.getElementById("resetView")
let code = document.getElementById("code")
let url = new URL(window.location.href)
if (url.searchParams.getAll("code").length > 0){
  var levelCode = url.searchParams.getAll("code")[0]
  levelCode = levelCode.split("-")
  level = levelCode.map(v => atob(v))
  level = level.map(v => v.toLowerCase())
  level = level.map(v => v.replaceAll("+","-"))
}

let elements = { //for converting to level code
  "player": "p",
  "ghostPen": "g",
  "wall": "0",
  "tunnel": "t",
  "nothing": "-",
  "dot": ".",
  "powerPellet": "o",
  "inky": "i",
  "pinky": "a",
  "blinky": "b",
  "clyde": "c"
}

images = {}

window.onkeydown = ({key}) => {
  if (!input.includes(key)){
    input.push(key)
  }
}
window.onkeyup = ({key}) => {
  input.splice(input.indexOf(key),1)
}

function drawGrid(){
  let camFloor = createVector(floor(camera.x),floor(camera.y))
  for (let y = camFloor.y; y < camFloor.y+17; y++){
    line(camFloor.x,y,camFloor.x+17,y)
  }
  for (let x = camFloor.x; x < camFloor.x+17; x++){
    line(x,camFloor.y,x,camFloor.y+17)
  }
}

function inView(pos){
  let camFloor = createVector(floor(camera.x),floor(camera.y))
  if (pos.x > camFloor.x+17 || pos.x < camFloor.x){
    return false
  }
  if (pos.y > camFloor.y+17 || pos.y < camFloor.y){
    return false
  }
  return true
}

reset.onclick = () => {
  let conf = confirm("are you sure you want to erase the whole level? (this cannot be undone)")
  if (conf){
    level = []
  }
}

viewReset.onclick = () => {
  camera.set(0,0)
}

function setup(){
  gridSize = createVector(16,16)
  camera = createVector()
  strokeWeight(width/1000)
  resizeCanvas(window.innerHeight*0.85,window.innerHeight*0.85)
  images = {
    "b": loadImage("sprites/b.png"),
    "c": loadImage("sprites/c.png"),
    "g": loadImage("sprites/g.png"),
    "i": loadImage("sprites/i.png"),
    "p": loadImage("sprites/p.png"),
    "a": loadImage("sprites/a.png")
  }
}

function isValid(x,y){
  if (x < 0 || y < 0){
    return false
  }
  if (y > level.length - 1){
    return false
  }
  
  if (x > level[y].length - 1){
    return false
  }
  return true
}

function draw(){
  selected = elements[dropDown.value]
  scale(width/16, width/16)
  background(0x11)
  translate(-camera.x,-camera.y)

  hmove = input.includes("ArrowRight") - input.includes("ArrowLeft")
  vmove = input.includes("ArrowDown") - input.includes("ArrowUp")

  camera.add(hmove * speed.value, vmove * speed.value)
  camera.set(max(0,camera.x), max(0,camera.y))
  
  targetCell = createVector(mouseX,mouseY).div(width/16).add(camera)
  targetCell.set(floor(targetCell.x),floor(targetCell.y))

  mouseIn = inView(targetCell)

  if (mouseIsPressed && mouseIn){
    level.length = max(targetCell.y,level.length)
    if (level[targetCell.y] === undefined){
      level[targetCell.y] = "-".repeat(targetCell.x)
    }
    array = level[targetCell.y].split("")
    array[targetCell.x] = selected
    array = Array.from(array, v => v === undefined ? '-' : v)
    level[targetCell.y] = array.join("")
  }
  level = Array.from(level, v => v === undefined ? '-' : v)

  noStroke()
  for (let y = 0; y < level.length; y++){
    if (level[y] === undefined){
      continue
    }
    for (let x = 0; x < level[y].length; x++){
      switch (level[y][x]){
        case "0":
          fill(0x0,0x0,0xff)
          rect(x,y,1,1)
          break
        case ".":
          fill(0xff)
          circle(x+0.5,y+0.5,0.15)
          break
        case "o":
          fill(0xff)
          circle(x+0.5,y+0.5,0.4)
          break
        case "t":
          fill(0xaa)
          rect(x,y,1,1)
          break
        case "-":
          fill(0x1a)
          rect(x,y,1,1)
          break
        case "b":
        case "c":
        case "g":
        case "i":
        case "p": 
        case "a":
          scale(1/16)
          image(images[level[y][x]], x * 16, y * 16)
          scale(16)
          break
      }
    }
  }

  if (level.length > 0){
    level = level.map(v => v.replace(/\-+$/, ""))
    let w = 0
    for (i of level){
      if (i.length > w){
        w = i.length
      }
    }

    for (i = level.length-1; i >= 0; i--){
      if (!level[i].match(/[^-]/)){
        level.length--
        continue
      }else{
        break
      }
    }

    for (i of level){
      level[level.indexOf(i)] += "-".repeat(max(0, w - i.length))
    }
    
    let newlevel = [].concat(level)
    for (let y = 0; y < newlevel.length; y++){
      var i = newlevel[y]
      for (let x = 0; x < i.length; x++){
        if (newlevel[y][x] == "0"){
          continue
        }
        
        let northSouth = false //north/south is open
        let eastWest = false //west/east is open
        //horizontal
        if (isValid(x+1,y)){
          if (newlevel[y][x+1] != "0"){
            eastWest = true
          }
        }
        if (isValid(x-1,y)){
          if (newlevel[y][x-1] != "0"){
            eastWest = true
          }
        }
        //vertical
        if (isValid(x,y+1)){
          if (newlevel[y+1][x] != "0"){
            northSouth = true
          }
        }
        if (isValid(x,y-1)){
          if (newlevel[y-1][x] != "0"){
            northSouth = true
          }
        }

        if (northSouth && eastWest){
          array = newlevel[y].split("")
          if (newlevel[y][x] == "." || newlevel[y][x] == "-"){
            array[x] = "+"
          }else{
            array[x] = array[x].toUpperCase()
          }
          newlevel[y] = array.join("")
        }
      }
    }
    
    encodedLevel = newlevel.map(v => btoa(v))
    finalCode = encodedLevel.join("-")
    //there are better ways to do this... but this works and I'm too lazy to do the better way.
    let newhtml = "<summary>code</summary>"+'<a href="https://pacman-rewrite.seamusdonahue.repl.co?code='+finalCode+'" target="_blank">'+finalCode+"</a>"
    if (code.innerHTML != newhtml){
      code.innerHTML = newhtml
    }
  }
  
  fill(255,255,255,40)
  rect(targetCell.x,targetCell.y,1,1)

  stroke(0x22)
  drawGrid()
}