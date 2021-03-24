import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { AddressInfo } from 'net';
import addTownsRoutes from '../router/towns';
import addUserInvitationRoutes from '../router/userInvitations';
import TownsServiceClient, { TownCreateResponse } from './TownsServiceClient';
import UserServiceClient from './UsersInvitationClient';

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

  describe('InvitationAndAcceptAPI', () => {
    it('should be matched', async () => {
      const response1 = await apiClient.getInvitationIDOfTown({ townID: town1.coveyTownID });
      const response2 = await apiClient.joinUsingUrl({ invitationID: response1.invitationID });
      expect(response2.conveyTownID).toBe(town1.coveyTownID);
      expect(response2.friendlyName).toBe('town1');
    });
  });
  describe('CreateUserAPI', () => {
    it('should create two different users', async () => {
      const response1 = await apiClient.createUser({ username: 'user1' });
      const response2 = await apiClient.createUser({ username: 'user2' });
      expect(response1.username).toBe('user1');
      expect(response2.username).toBe('user2');
      expect(response1.userToken).not.toBe(response2.userToken);
      expect(response1.userID).not.toBe(response2.userToken);
    });
  });

  describe('ListUserAPI', () => {
    it('should list all users', async () => {
      expect((await apiClient.listUsers()).users.length).toBe(0);
      await apiClient.createUser({ username: 'user1' });
      expect((await apiClient.listUsers()).users.length).toBe(1);
      await apiClient.createUser({ username: 'user2' });
      expect((await apiClient.listUsers()).users.length).toBe(2);
    });
  });
});
