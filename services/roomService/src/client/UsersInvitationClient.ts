import assert from 'assert';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

// TODO: request/response types

export interface CreateUserBodyRequest {
  username: string;
}
export interface CreateUserBodyResponse {
  username: string;
  userID: string;
  userToken: string;
}
export interface ListUserBodyResponse {
  users: { username: string; userID: string }[];
}

export interface GetInvitationIDBodyRequest {
  townID: string;
}
export interface GetInvitationIDBodyResponse {
  invitationID: string;
}

export interface InviteUserInSystemBodyRequest {
  coveyTownID: string;
  invitedUserID: string;
}
export interface InviteUserInSystemBodyResponse {
  invitationSent: boolean;
}
export interface JoinInvitationBodyRequest {
  invitationID: string;
}
export interface JoinInvitationBodyResponse {
  conveyTownID: string;
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

  // TODO: making axios requests
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

  async inviteUserInSystem(requestData: InviteUserInSystemBodyRequest): Promise<InviteUserInSystemBodyResponse> {
    const responseWrapper = await this._axios.post<ResponseEnvelope<InviteUserInSystemBodyResponse>>('/invitation', requestData);
    return UserServiceClient.unwrapOrThrowError(responseWrapper);
  }

  async joinUsingUrl(requestData: JoinInvitationBodyRequest): Promise<JoinInvitationBodyResponse> {
    const responseWrapper = await this._axios.get<ResponseEnvelope<JoinInvitationBodyResponse>>(`/joinInvitation/${requestData.invitationID}`);
    return UserServiceClient.unwrapOrThrowError(responseWrapper);
  }
}
