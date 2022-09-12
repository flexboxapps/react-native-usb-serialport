"use strict";

import {
  EmitterSubscription,
  NativeEventEmitter,
  NativeModules,
  Platform,
} from "react-native";
import EventEmitter from "eventemitter3";
const Sockets = Platform.OS === "android" ? NativeModules.RNSerialport : {};
import Socket, { AddressInfo, NativeConnectionInfo } from "./Socket";
import { nativeEventEmitter, getNextId } from "./Globals";

class Server extends EventEmitter<
  "connection" | "listening" | "error" | "close"
> {
  private _id: number;
  private _eventEmitter: NativeEventEmitter;
  private _connections: Set<Socket>;
  private _localAddress: string | undefined;
  private _localPort: number | undefined;
  private _localFamily: string | undefined;
  listening: boolean;

  private _errorListener: EmitterSubscription | undefined;
  private _connectionsListener: EmitterSubscription | undefined;

  /**
   * Automatically set as a listener for the `'connection'` event.
   */
  constructor(connectionCallback: (socket: Socket) => void) {
    super();
    this._id = getNextId();
    this._eventEmitter = nativeEventEmitter;
    this._connections = new Set();
    this._localAddress = undefined;
    this._localPort = undefined;
    this._localFamily = undefined;
    this.listening = false;
    this._registerEvents();
    if (connectionCallback) this.on("connection", connectionCallback);
    this.on("close", this._setDisconnected, this);
  }

  /**
   * Start a server listening for connections.
   *
   * This function is asynchronous. When the server starts listening, the `'listening'` event will be emitted.
   * The last parameter `callback` will be added as a listener for the `'listening'` event.
   *
   * The `server.listen()` method can be called again if and only if there was an error during the first
   * `server.listen()` call or `server.close()` has been called. Otherwise, an `ERR_SERVER_ALREADY_LISTEN`
   * error will be thrown.
   */
  listen(
    options: { port: number; host?: string; reuseAddress?: boolean },
    callback: () => void
  ): Server {
    if (this._localAddress !== undefined)
      throw new Error("ERR_SERVER_ALREADY_LISTEN");
    const gotOptions = { ...options };
    gotOptions.host = gotOptions.host || "0.0.0.0";
    this.once("listening", () => {
      this.listening = true;
      if (callback) callback();
    });
    Sockets.listen(this._id, gotOptions);
    return this;
  }

  /**
   * Asynchronously get the number of concurrent connections on the server.
   *
   * Callback should take two arguments `err` and `count`.
   */
  getConnections(callback: (err: Error | null, count: number) => void): Server {
    callback(null, this._connections.size);
    return this;
  }

  /**
   * Stops the server from accepting new connections and keeps existing connections.
   * This function is asynchronous, the server is finally closed when all connections are ended and the server emits a `'close'` event.
   * The optional callback will be called once the `'close'` event occurs. Unlike that event, it will be called with an `Error` as its
   * only argument if the server was not open when it was closed.
   */
  close(callback?: (err?: Error) => void): Server {
    if (!this._localAddress) {
      callback?.(new Error("ERR_SERVER_NOT_RUNNING"));
      return this;
    }
    if (callback) this.once("close", callback);
    this.listening = false;
    Sockets.close(this._id);
    return this;
  }

  /**
   * Returns the bound `address`, the address `family` name, and `port` of the server as reported by the operating system if listening
   * on an IP socket (useful to find which port was assigned when getting an OS-assigned address):
   * `{ port: 12346, family: 'IPv4', address: '127.0.0.1' }`.
   */
  address(): AddressInfo | null {
    if (!this._localAddress) return null;
    if (this._localFamily == undefined || this._localPort == undefined)
      return null;

    return {
      address: this._localAddress,
      port: this._localPort,
      family: this._localFamily,
    };
  }

  ref() {
    console.warn(
      "react-native-tcp-socket: Server.ref() method will have no effect."
    );
    return this;
  }

  unref() {
    console.warn(
      "react-native-tcp-socket: Server.unref() method will have no effect."
    );
    return this;
  }

  destroy() {
    try {
      this.emit("close");
      this._errorListener?.remove();
      this._connectionsListener?.remove();
    } catch (error) {}
  }

  private _registerEvents() {
    this._errorListener = this._eventEmitter.addListener("listening", (evt) => {
      if (evt.id !== this._id) return;
      this._localAddress = evt.connection.localAddress;
      this._localPort = evt.connection.localPort;
      this._localFamily = evt.connection.localFamily;
      this.emit("listening");
    });

    this._errorListener = this._eventEmitter.addListener("error", (evt) => {
      if (evt.id !== this._id) return;
      this.close();
      this.emit("error", evt.error);
    });

    this._connectionsListener = this._eventEmitter.addListener(
      "connection",
      (evt) => {
        if (evt.id !== this._id) return;
        const newSocket = this._buildSocket(evt.info);
        // Emit 'close' when all connection closed
        newSocket.on("close", () => {
          this._connections.delete(newSocket);
          if (!this.listening && this._connections.size === 0)
            this.emit("close");
        });
        this._connections.add(newSocket);
        this.emit("connection", newSocket);
      }
    );
  }

  private _setDisconnected() {
    this._localAddress = undefined;
    this._localPort = undefined;
    this._localFamily = undefined;
  }

  private _buildSocket(info: NativeConnectionInfo): Socket {
    const newSocket = new Socket();
    console.warn("SERVER _buildSocket info:", JSON.stringify(info));
    // newSocket._setId(info.id);
    // newSocket._setConnected(info.connection);
    return newSocket;
  }
}

export default Server;
