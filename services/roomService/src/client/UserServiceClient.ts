import assert from 'assert';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

/**
 * The format of a creating a user request
 */
export interface CreateUserBodyRequest {
  // the username provided by user
  username: string;
}

/**
 * The format of a creating user response. Client is using the userToken to create socket.
 */
export interface CreateUserBodyResponse {
  username: string;
  userID: string;
  userToken: string;
}

/**
 * The format of a list current user request
 */
export interface ListUserBodyResponse {
  users: { username: string; userID: string }[];
}

/**
 * The url param of a invitationID request
 */
export interface GetInvitationIDBodyRequest {
  townID: string;
}

/**
 * The format of a invitationID response
 */
export interface GetInvitationIDBodyResponse {
  invitationID: string;
}

/**
 * The format of inviting a in system user to a town request
 */
export interface InviteUserInSystemBodyRequest {
  coveyTownID: string;
  invitedUserID: string;
}

/**
 * The url param of join as a outside user request
 */
export interface JoinInvitationBodyRequest {
  invitationID: string;
}
/**
 * The format of join as a outside user response
 */
export interface JoinInvitationBodyResponse {
  coveyTownID: string;
  friendlyName: string;
}

/**
 * Envelope that wraps any response from the server
 */
export interface ResponseEnvelope<T> {
  isOK: boolean;
  message?: string;
  response?: T;
}
export default class UserServiceClient {
  private _axios: AxiosInstance;

  /**
   * Construct a new Towns Service API client. Specify a serviceURL for testing, or otherwise
   * defaults to the URL at the environmental variable REACT_APP_ROOMS_SERVICE_URL
   * @param serviceURL
   */
  constructor(serviceURL?: string) {
    const baseURL = serviceURL || process.env.REACT_APP_TOWNS_SERVICE_URL;
    assert(baseURL);
    this._axios = axios.create({ baseURL });
  }

  static unwrapOrThrowError<T>(response: AxiosResponse<ResponseEnvelope<T>>, ignoreResponse = false): T {
    if (response.data.isOK) {
      if (ignoreResponse) {
        return {} as T;
      }
      assert(response.data.response);
      return response.data.response;
    }
    throw new Error(`Error processing request: ${response.data.message}`);
  }

  async createUser(requestData: CreateUserBodyRequest): Promise<CreateUserBodyResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<CreateUserBodyResponse>>('/user', requestData);
    return UserServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async listUsers(): Promise<ListUserBodyResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<ListUserBodyResponse>>('/user');
    return UserServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async getInvitationIDOfTown(requestData: GetInvitationIDBodyRequest): Promise<GetInvitationIDBodyResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<GetInvitationIDBodyResponse>>(`/invitation/${requestData.townID}`);
    return UserServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async inviteUserInSystem(requestData: InviteUserInSystemBodyRequest): Promise<Record<string, null>> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<Record<string, null>>>('/invitation', requestData);
    return UserServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async joinUsingUrl(requestData: JoinInvitationBodyRequest): Promise<JoinInvitationBodyResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<JoinInvitationBodyResponse>>(`/joinInvitation/${requestData.invitationID}`);
    return UserServiceClient.unwrapOrThrowError(responseWrapper);
  }
}
