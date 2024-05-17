import { WebSocket } from "ws";
import { Member } from "./Member";

export class Room {
    public roomId: number = -1;
    public roomName: string ="random-name";
    public members: Array<Member> = [];
    public idCounter: number = 0;
  
    constructor(roomId: number, roomName: string, members: Array<Member>) { 
      this.roomId = roomId;
      this.roomName = roomName;
      this.members = members;
    }
    public getRoomId = () => {
      return this.roomId;
    }
    public getRoomName = () => {
      return this.roomName;
    }
    public getMembers = () => {
      return this.members;
    }
    public setRoomId = (roomId: number) => {
      this.roomId = roomId;
    }
    public setRoomName = (roomName: string) => {
      this.roomName = roomName;
    }
    public setMembers = (members: Array<Member>) => {
      this.members = members;
    }
    public addMember = (ws: WebSocket) => {
      const id:number = this.idCounter;
      const member: Member = new Member(ws, id);
      this.idCounter = id + 1;
      this.members.push(member);
      return id;
    }
  }