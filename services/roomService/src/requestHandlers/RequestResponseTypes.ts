import { CoveyTownList, CoveyUserList } from '../CoveyTypes';
import Player from '../types/Player';

/**
 * The format of a request to join a Town in Covey.Town, as dispatched by the server middleware
 */
export interface TownJoinRequest {
  /** userName of the player that would like to join * */
  userName: string;
  /** ID of the town that the player would like to join * */
  coveyTownID: string;
}

/**
 * The format of a response to join a Town in Covey.Town, as returned by the handler to the server
 * middleware
 */
export interface TownJoinResponse {
  /** Unique ID that represents this player * */
  coveyUserID: string;
  /** Secret token that this player should use to authenticate
   * in future requests to this service * */
  coveySessionToken: string;
  /** Secret token that this player should use to authenticate
   * in future requests to the video service * */
  providerVideoToken: string;
  /** List of players currently in this town * */
  currentPlayers: Player[];
  /** Friendly name of this town * */
  friendlyName: string;
  /** Is this a private town? * */
  isPubliclyListed: boolean;
}

/**
 * Payload sent by client to create a Town in Covey.Town
 */
export interface TownCreateRequest {
  friendlyName: string;
  isPubliclyListed: boolean;
}

/**
 * Response from the server for a Town create request
 */
export interface TownCreateResponse {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Response from the server for a Town list request
 */
export interface TownListResponse {
  towns: CoveyTownList;
}

/**
 * Payload sent by the client to delete a Town
 */
export interface TownDeleteRequest {
  coveyTownID: string;
  coveyTownPassword: string;
}

/**
 * Payload sent by the client to update a Town.
 * N.B., JavaScript is terrible, so:
 * if(!isPubliclyListed) -> evaluates to true if the value is false OR undefined, use ===
 */
export interface TownUpdateRequest {
  coveyTownID: string;
  coveyTownPassword: string;
  friendlyName?: string;
  isPubliclyListed?: boolean;
}

/**
 * payload sent by client to see the invitationLink of a town
 */
export interface GetInvitationLinkRequest {
  coveyTownID: string;
}

/**
 * response from the server of a GetInvitaitonLinkRequest 
 */
export interface GetInvitationLinkResponse {
  invitationID: string;
}

/**
 * response from the server of a getUserList request
 */
export interface UserListResponse {
  users: CoveyUserList;
}

/**
 * payload sent by client for Join Link (join as a outside user)
 */
export interface JoinLinkRequest {
  invitationID: string;
}

/**
 * response from the server of a JoinLinkRequest
 */
export interface JoinLinkResponse {
  coveyTownID: string;
  friendlyName: string;
}

/**
 * payload sent by client for creating a username
 */
export interface UserCreateRequest {
  username: string;
}

/**
 * response from the server of a UserCreatingRequest
 */
export interface UserCreateResponse {
  username: string;
  userID: string;
  userToken: string;
}

/**
 * payload sent by client to invite a user already in the system to a existing town
 */
export interface InviteUserInSystemRequest {
  invitedUserID: string;
  coveyTownID: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}
