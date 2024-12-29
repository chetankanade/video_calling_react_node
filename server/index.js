const { Server } = require("socket.io");
const io = new Server(8000, {
  cors: true,
});

//Keeping track of which email belongs to which room
const emailToSocketIdMap = new Map();

//Reverse mapping of email using socket id
const socketIdToemailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket connected`, socket.id);

  //listening socket event, getting data from frontend
  socket.on("room:join", (data) => {
    const { email, room } = data;

    //setting email with socket id (key:value)
    emailToSocketIdMap.set(email, socket.id);

    //setting socket id with email (key:value)
    socketIdToemailMap.set(socket.id, email);

    //(1)sending data back to user(like we use this data(to keep track))
    io.to(socket.id).emit("room:join", data);
  });
});
