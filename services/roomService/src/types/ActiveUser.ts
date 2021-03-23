import { nanoid } from 'nanoid';

/**
 * Each user who is connected to a town is represented by a Player object
 */
export default class ActiveUser {
  /** The current location of this user in the world map * */

  /** The unique identifier for this player * */
  private readonly _id: string;

  /** The player's username, which is not guaranteed to be unique within the town * */
  private readonly _username: string;

  private readonly _token: string;

  constructor(username: string) {
    this._username = username;
    this._id = nanoid();
    this._token = nanoid();
  }

  get username(): string {
    return this._username;
  }

  get id(): string {
    return this._id;
  }

  get token(): string {
    return this._token;
  }
}
