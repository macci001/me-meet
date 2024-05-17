import { WebSocket } from "ws";

export class Member {
    public ws: WebSocket | null = null;
    public id: number = -1;
    constructor(ws: WebSocket, id: number) {
      this.ws = ws;
      this.id = id;
    }
  }