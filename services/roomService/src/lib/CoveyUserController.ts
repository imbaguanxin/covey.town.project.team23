import { Socket } from 'socket.io';
import ActiveUser from '../types/ActiveUser';
import { CoveyUserList, CoveyUser, CoveyCreateUser } from '../CoveyTypes';
import CoveyInvitationListener from '../types/CoveyInvitationListener';

function socketAdapter(socket: Socket, userID: string): CoveyInvitationListener {
  return {
    getUserID() {
      return userID;
    },
    onDisconnect() {
      socket.disconnect();
    },
    onInvited(coveyTownID: string) {
      socket.emit('invitedToTown', coveyTownID);
    },
  };
}

export default class CoveyUserController {
  private static _instance: CoveyUserController;

  private _users: ActiveUser[] = [];

  private _listeners: CoveyInvitationListener[] = [];

  static getInstance(): CoveyUserController {
    if (CoveyUserController._instance === undefined) {
      CoveyUserController._instance = new CoveyUserController();
    }
    return CoveyUserController._instance;
  }

  getUsers(): CoveyUserList {
    return this._users.map(user => ({ username: user.username, userID: user.id }));
  }

  private findUserByID(id: string): ActiveUser | undefined {
    return this._users.find(user => user.id === id);
  }

  getUserByID(id: string): CoveyUser | undefined {
    const targetUser = this.findUserByID(id);
    if (targetUser !== undefined) {
      return {
        username: targetUser.username,
        userID: targetUser.id,
      };
    }
    return undefined;
  }

  createUser(username: string): CoveyCreateUser {
    const newUser = new ActiveUser(username);
    this._users.push(newUser);
    return {
      username: newUser.username,
      userID: newUser.id,
      userToken: newUser.token,
    };
  }

  deleteUser(id: string): boolean {
    const existingUser = this.getUserByID(id);
    if (existingUser !== undefined) {
      this._users = this._users.filter(user => user.id !== id);
      this._listeners = this._listeners.filter(userSocket => userSocket.getUserID() !== id);
      return true;
    }
    return false;
  }

  addListner(listener: CoveyInvitationListener): void {
    this._listeners.push(listener);
  }

  inviteUser(userID: string, coveyTownID: string): boolean {
    const user = this.findUserByID(userID);
    if (user === undefined) {
      return false;
    }
    const userSocket = this._listeners.find(listener => listener.getUserID() === userID);
    if (userSocket === undefined) {
      return false;
    }
    userSocket.onInvited(coveyTownID);
    return true;
  }

  connect(userID: string, userToken: string, socket: Socket): void {
    const activeUser = this.findUserByID(userID);
    if (activeUser === undefined) {
      socket.disconnect(true);
      return;
    }

    if (activeUser.token !== userToken) {
      socket.disconnect(true);
      return;
    }

    const invitationListner = socketAdapter(socket, userID);
    this.addListner(invitationListner);

    socket.on('disconnect', () => {
      this.deleteUser(userID);
    });
  }
}
