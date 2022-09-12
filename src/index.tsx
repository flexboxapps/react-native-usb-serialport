"use strict";

import Socket, { ConnectionOptions } from "./Socket";
import Server from "./Server";

function createServer(connectionListener: (socket: Socket) => void) {
  return new Server(connectionListener);
}

function createConnection(
  options: ConnectionOptions,
  callback: () => void
): Socket {
  const tcpSocket = new Socket();
  return tcpSocket.connect(options, callback);
}

export { createServer, createConnection, Server, Socket };
