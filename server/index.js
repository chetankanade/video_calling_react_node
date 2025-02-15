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

    //(2)if any one already present in a room, then it will notify them, that a new user joined
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);

    //(1)sending data back to user(we use this data(to keep track))
    io.to(socket.id).emit("room:join", data);
  });

  //(3)
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incoming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    // (6)
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  // (8)
  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  // (9)
  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});
