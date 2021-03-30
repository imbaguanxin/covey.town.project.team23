import { Socket } from 'socket.io';
import CoveyTownsStore from '../lib/CoveyTownsStore';
import CoveyUserController from '../lib/CoveyUserController';
import {
  GetInvitationLinkRequest,
  GetInvitationLinkResponse,
  InviteUserInSystemRequest,
  InviteUserInSystemResponse,
  JoinLinkRequest,
  JoinLinkResponse,
  ResponseEnvelope,
  UserCreateRequest,
  UserCreateResponse,
  UserListResponse,
} from './RequestResponseTypes';

export async function userCreateHandler(requestData: UserCreateRequest): Promise<ResponseEnvelope<UserCreateResponse>> {
  if (requestData.username.length === 0) {
    return { isOK: false, message: 'Username must be specified' };
  }
  const usersStore = CoveyUserController.getInstance();
  const result = usersStore.createUser(requestData.username);
  return {
    isOK: true,
    response: { username: result.username, userID: result.userID, userToken: result.userToken },
  };
}

/**
 * A handler list all users
 * @returns
 */
export async function userListHandler(): Promise<ResponseEnvelope<UserListResponse>> {
  const userController = CoveyUserController.getInstance();
  return { isOK: true, response: { users: userController.getUsers() } };
}

/**
 *
 * @param requestData
 * @returns
 */
export async function getInvitationLinkHandler(requestData: GetInvitationLinkRequest): Promise<ResponseEnvelope<GetInvitationLinkResponse>> {
  const townsStore = CoveyTownsStore.getInstance();
  const coveyTownController = townsStore.getControllerForTown(requestData.coveyTownID);

  if (!coveyTownController) {
    return { isOK: false, message: 'Error: No such town' };
  }
  return { isOK: true, response: { invitationID: coveyTownController.invitationID } };
}

/**
 *
 * @param requestData
 * @returns
 */
export async function joinLinkHandler(requestData: JoinLinkRequest): Promise<ResponseEnvelope<JoinLinkResponse>> {
  const townsStore = CoveyTownsStore.getInstance();
  const coveyTownController = townsStore.getControllerFromInvitationID(requestData.invitationID);

  if (!coveyTownController) {
    return { isOK: false, message: 'Error: No such town' };
  }
  return {
    isOK: true,
    response: {
      coveyTownID: coveyTownController.coveyTownID,
      friendlyName: coveyTownController.friendlyName,
    },
  };
}

export async function inviteUserInSystemHandler(requestData: InviteUserInSystemRequest): Promise<ResponseEnvelope<InviteUserInSystemResponse>> {
  const userController = CoveyUserController.getInstance();
  const result = userController.inviteUser(requestData.invitedUserID, requestData.coveyTownID);
  return {
    isOK: true,
    response: {
      invitationSent: result,
    },
  };
}

export function userSubscriptionHandler(socket: Socket): void {
  const { userID, token } = socket.handshake.auth as { userID: string; token: string };
  const userController = CoveyUserController.getInstance();
  userController.connect(userID, token, socket);
}
