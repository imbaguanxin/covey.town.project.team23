import { Socket } from 'socket.io';
import { CoveyCreateUser, CoveyUser, CoveyUserList } from '../CoveyTypes';
import ActiveUser from '../types/ActiveUser';
import CoveyInvitationListener from '../types/CoveyInvitationListener';
import CoveyTownsStore from './CoveyTownsStore';
/**
 * An adapter between CoveyUserController's event interface (CoveyInvitationListener) and the Socket
 * @param socket the Socket object that we use to communivate the player
 * @param userID the userID of the socket's owner 
 * @returns 
 */
function socketAdapter(socket: Socket, userID: string): CoveyInvitationListener {
  return {
    getUserID() {
      return userID;
    },
    onDisconnect() {
      socket.disconnect();
    },
    onInvited(coveyTownID: string, friendlyName: string) {
      socket.emit('invitedToTown', { coveyTownID, friendlyName });
    },
  };
}

/**
 * The CoveyUserController stores the user information and manage the events including creating a user, leaving the system, and receiving invitations
 */
export default class CoveyUserController {
  private static _instance: CoveyUserController;

  /** The users in the system */
  private _users: ActiveUser[] = [];

  /** The list of CoveyInvitationListners that listens the invitations */
  private _listeners: CoveyInvitationListener[] = [];

  static getInstance(): CoveyUserController {
    if (CoveyUserController._instance === undefined) {
      CoveyUserController._instance = new CoveyUserController();
    }
    return CoveyUserController._instance;
  }

  /** Show all existing users */
  getUsers(): CoveyUserList {
    return this._users.map(user => ({ username: user.username, userID: user.id }));
  }

  private findUserByID(id: string): ActiveUser | undefined {
    return this._users.find(user => user.id === id);
  }

  /** Find the user information by userID
   * 
   * @param id
   */
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

  /** Create a user with a given username, returns username, userID and userToken. userToken is for socket subscripition.
   * 
   * @param username
   */
  createUser(username: string): CoveyCreateUser {
    const newUser = new ActiveUser(username);
    this._users.push(newUser);
    return {
      username: newUser.username,
      userID: newUser.id,
      userToken: newUser.token,
    };
  }

  /** Delete a user by UserID */
  deleteUser(id: string): boolean {
    const existingUser = this.getUserByID(id);
    if (existingUser !== undefined) {
      this._users = this._users.filter(user => user.id !== id);
      this._listeners = this._listeners.filter(userSocket => userSocket.getUserID() !== id);
      return true;
    }
    return false;
  }

  /** Add a invitation listner */
  addListner(listener: CoveyInvitationListener): void {
    this._listeners.push(listener);
  }

  /** Send a invitation from a given Town to a given user
   * 
   * @param userID the invited user
   * @param coveyTownID the town which the user is invited to
   */
  inviteUser(userID: string, coveyTownID: string): boolean {
    const user = this.findUserByID(userID);
    if (user === undefined) {
      return false;
    }
    const userSocket = this._listeners.find(listener => listener.getUserID() === userID);
    if (userSocket === undefined) {
      return false;
    }
    const townController = CoveyTownsStore.getInstance().getControllerForTown(coveyTownID);
    if (townController === undefined) {
      return false;
    }
    userSocket.onInvited(coveyTownID, townController.friendlyName);
    return true;
  }

/**
 * Connect a socket to this controller
 * We use a userToken here since everyone can use listUser() to get the user id. Simply relying on userID might lead to replication of socket registration.
 * @param userID the userID of the new comming user
 * @param userToken the userToken of the new comming user
 * @param socket the socket provided by user
 */
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
