const express = require('express');
const socket = require('socket.io');
const http = require("http");  
const path = require("path");   
const {Chess} = require("chess.js");
const app = express();
const server = http.createServer(app);
const io = socket(server);
const chess = new Chess();
let players={};
let currentplayer = "w";
app.set("view engine","ejs");
app.use(express.static(path.join(__dirname, "public")));
app.get('/',(req,res)=>{
    res.render("index");
})
io.on('connection',function(unqiuesocket){
 console.log("connected");
 if(!players.white){
    players.white = unqiuesocket.id;
    unqiuesocket.emit("playerRole","w");
 }
 else if(!players.black){
    players.black = unqiuesocket.id;
    unqiuesocket.emit('playerRole',"b");
 }
 else{
    unqiuesocket.emit('spectatorRole');
 }
 unqiuesocket.on('disconnect',function(){
    if(unqiuesocket.id === players.black){
        delete players.black;
    }
    else if (unqiuesocket.id === players.white){
        delete players.white;
    }
 })
  unqiuesocket.on("move",(move)=>{
    try{
        if(chess.turn() === 'w' && unqiuesocket.id!==players.white){
                return;
        }
        if(chess.turn() === 'b' && unqiuesocket.id!==players.black){
                return;
        }
      const result =  chess.move(move);
      if(result){
        currentplayer = chess.turn();
        io.emit('move',move);
        io.emit("broadState",chess.fen());
      }
      else{
        console.log("Invalid move ",move);
        unqiuesocket.emit("Invalid move",move);
      }
    }catch(err){
        console.log(err);
        unqiuesocket.emit("Invalid move",move)
    }
  })
})
server.listen(3000,()=>{
    console.log("Server is listening on port 3000");
});