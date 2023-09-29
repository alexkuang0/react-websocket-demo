const WebSocket = require("ws")

const server = new WebSocket.Server({ port: 8080 })

server.on("connection", (socket) => {
  console.log("New client connected")

  const timeoutFn = () => {
    socket.close()
    console.log("Connection closed due to timeout")
  }

  let timeout = setTimeout(timeoutFn, 5000)

  socket.on("message", (message) => {
    console.log(`Received: ${message}`)
    clearTimeout(timeout)
    timeout = setTimeout(timeoutFn, 5000)
    socket.send(message.toString())
  })

  socket.on("close", () => {
    clearTimeout(timeout)
    console.log("Connection closed")
  })
})

console.log("WebSocket server is running on port 8080")
