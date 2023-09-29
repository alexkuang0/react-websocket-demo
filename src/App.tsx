import { useState, useEffect, useRef, useCallback } from "react"
import type { FormEvent } from "react"

const App = () => {
  const [msgList, setMsgList] = useState<string[]>([])
  const [msgInput, setMsgInput] = useState<string>("")
  const ws = useRef<WebSocket>()

  const addNewMsg = useCallback(
    (msg: string) => setMsgList((prev) => [...prev, msg]),
    []
  )

  const setupWebSocket = useCallback(
    (url: string) => {
      const socket = new WebSocket(url)
      socket.onopen = () => addNewMsg("System: connection opened.")
      socket.onclose = () => addNewMsg("System: connection closed.")
      socket.onmessage = (e) => addNewMsg(`Server: ${e.data}`)
      return socket
    },
    [addNewMsg]
  )

  const waitWhenConnecting = useCallback(
    (socket: WebSocket, timeout = 5000, checkInterval = 100) =>
      new Promise((resolve, reject) => {
        const start = Date.now()

        ;(function checkConnection() {
          if (socket.readyState === WebSocket.OPEN) resolve(null)
          else if (Date.now() - start > timeout) reject("Connection time out")
          else setTimeout(checkConnection, checkInterval)
        })()
      }),
    []
  )

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault()

      if (
        ws.current?.readyState === WebSocket.CLOSED ||
        ws.current?.readyState === WebSocket.CLOSING
      ) {
        ws.current = setupWebSocket("ws://localhost:8080")
      }

      if (ws.current?.readyState === WebSocket.CONNECTING) {
        try {
          await waitWhenConnecting(ws.current)
        } catch (error) {
          addNewMsg(`System: ${error}`)
          return
        }
      }

      if (ws.current) {
        ws.current.send(msgInput)
        addNewMsg(`You: ${msgInput}`)
        setMsgInput("")
      }
    },
    [addNewMsg, setupWebSocket, waitWhenConnecting, msgInput]
  )

  useEffect(() => {
    ws.current = setupWebSocket("ws://localhost:8080")
    return () => ws.current?.close()
  }, [setupWebSocket])

  return (
    <>
      <ul>
        {msgList.map((msg) => (
          <li>{msg}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={msgInput}
          onChange={(e) => setMsgInput(e.target.value)}
        />
        <button>Send</button>
      </form>
    </>
  )
}

export default App
