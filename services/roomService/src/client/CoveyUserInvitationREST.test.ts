import { assert } from 'console';
import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import { getInvitationLinkHandler, joinLinkHandler } from '../requestHandlers/UserInvitationRequestHandlers';
import addTownsRoutes from '../router/towns';
import addUserInvitationRoutes from '../router/userInvitations';
import TownsServiceClient, { ResponseEnvelope, TownCreateResponse } from './TownsServiceClient';
import UserServiceClient from './UserServiceClient';

function unwrapResponse<T>(response: ResponseEnvelope<T>): T {
  if (response === undefined || response.response === undefined) {
    throw new Error(`Error processing request: ${response.message}`);
  }
  assert(response.response);
  return response.response;
}
describe('UserInvitationServiceAPIREST', () => {
  /* A testing server that will be deployed before testing and reused throughout all of the tests */
  let server: http.Server;
  /* A testing client that will be automatically configured with a serviceURL to point to the testing server */
  let apiClient: UserServiceClient;
  let townsApiClient: TownsServiceClient;
  let town1: TownCreateResponse;
  beforeAll(async () => {
    // Deploy a testing server
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);
    addTownsRoutes(server, app);
    addUserInvitationRoutes(server, app);
    server.listen();
    const address = server.address() as AddressInfo;

    // Create the testing client
    townsApiClient = new TownsServiceClient(`http://127.0.0.1:${address.port}`);
    apiClient = new UserServiceClient(`http://127.0.0.1:${address.port}`);
    town1 = await townsApiClient.createTown({
      friendlyName: 'town1',
      isPubliclyListed: true,
    });
  });
  afterAll(async () => {
    // After all tests are done, shut down the server to avoid any resource leaks
    server.close();
    await townsApiClient.deleteTown({
      coveyTownID: town1.coveyTownID,
      coveyTownPassword: town1.coveyTownPassword,
    });
  });

  describe('InvitationAndAcceptAsOutsideUserAPI', () => {
    it('The town id quried from invitation link and join invitation link should match', async () => {
      const response1 = await apiClient.getInvitationIDOfTown({ townID: town1.coveyTownID });
      const response2 = await apiClient.joinUsingUrl({ invitationID: response1.invitationID });
      expect(response2.coveyTownID).toBe(town1.coveyTownID);
      expect(response2.friendlyName).toBe('town1');
    });

    it('The join invitation link should be correct', async () => {
      const response1 = await apiClient.getInvitationIDOfTown({ townID: town1.coveyTownID });
      const response2 = unwrapResponse(await joinLinkHandler({ invitationID: response1.invitationID }));
      expect(response2.coveyTownID).toBe(town1.coveyTownID);
      expect(response2.friendlyName).toBe('town1');
    });

    it('The town id quried from invitation link should be correct', async () => {
      const response1 = unwrapResponse(await getInvitationLinkHandler({ coveyTownID: town1.coveyTownID }));
      const response2 = await apiClient.joinUsingUrl({ invitationID: response1.invitationID });
      expect(response2.coveyTownID).toBe(town1.coveyTownID);
      expect(response2.friendlyName).toBe('town1');
    });
  });
  describe('CreateUserAPI', () => {
    it('Each creation request should create different users', async () => {
      const response1 = await apiClient.createUser({ username: 'user1' });
      const response2 = await apiClient.createUser({ username: 'user2' });
      expect(response1.username).toBe('user1');
      expect(response2.username).toBe('user2');
      expect(response1.userToken).not.toBe(response2.userToken);
      expect(response1.userID).not.toBe(response2.userToken);
    });

    it('Should be able to create users with the same username', async () => {
      const newSameNameUser1 = await apiClient.createUser({ username: 'userSameName' });
      const newSameNameUser2 = await apiClient.createUser({ username: 'userSameName' });
      expect(newSameNameUser1.username).toBe(newSameNameUser2.username);
      expect(newSameNameUser1.userID).not.toBe(newSameNameUser2.userID);

      const userList = await apiClient.listUsers();
      const userIDList = userList.users.map(u => u.userID);
      expect(userIDList).toContain(newSameNameUser1.userID);
      expect(userIDList).toContain(newSameNameUser2.userID);
    });

    it('Should not allow empty string as username', async () => {
      try {
        await apiClient.createUser({ username: '' });
        fail('creatUser should throw an error if username is empty string');
      } catch (err) {
        // expected to throw error.
      }
    });
  });

  describe('ListUserAPI', () => {
    it('List user API should remain the same.', async () => {
      const listResponse = await apiClient.listUsers();
      const listResponse2 = await apiClient.listUsers();
      listResponse2.users.map(u => u.userID).forEach(id => expect(listResponse.users.map(u => u.userID)).toContain(id));
    });
    it('List user API should list refresh after creating new users', async () => {
      const initLength = (await apiClient.listUsers()).users.length;

      const user1 = await apiClient.createUser({ username: 'user1' });
      let listResponse = await apiClient.listUsers();
      expect(listResponse.users.length).toBe(initLength + 1);
      expect(listResponse.users.map(u => u.userID)).toContain(user1.userID);

      const user2 = await apiClient.createUser({ username: 'user2' });
      listResponse = await apiClient.listUsers();
      expect(listResponse.users.length).toBe(initLength + 2);
      expect(listResponse.users.map(u => u.userID)).toContain(user2.userID);
    });
  });
});
