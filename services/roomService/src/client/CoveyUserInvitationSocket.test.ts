import CORS from 'cors';
import Express from 'express';
import http from 'http';
import { nanoid } from 'nanoid';
import { AddressInfo } from 'net';
import addTownRoutes from '../router/towns';
import addUserInvitationRoutes from '../router/userInvitations';
import * as TestUtils from './TestUtils';
import TownsServiceClient from './TownsServiceClient';
import UserServiceClient from './UserServiceClient';

describe('UserServiceApiSocket', () => {
  let server: http.Server;
  let apiUserClient: UserServiceClient;
  let apiTownClient: TownsServiceClient;

  beforeAll(async () => {
    const app = Express();
    app.use(CORS());
    server = http.createServer(app);

    addTownRoutes(server, app);
    addUserInvitationRoutes(server, app);
    server.listen();
    const address = server.address() as AddressInfo;

    const testUrl = `http://127.0.0.1:${address.port}`;
    apiUserClient = new UserServiceClient(testUrl);
    apiTownClient = new TownsServiceClient(testUrl);
  });
  afterAll(async () => {
    server.close();
    TestUtils.cleanupSockets();
  });
  afterEach(() => {
    TestUtils.cleanupSockets();
  });
  it('Rejects invalid userID, even if otherwise valid token', async () => {
    const userData = await apiUserClient.createUser({ username: nanoid() });
    const { socketDisconnected } = TestUtils.createUserSocketClient(server, userData.userToken, nanoid());
    await socketDisconnected;
  });
  it('Rejects invalid userToken, even if otherwise valid userID', async () => {
    const userData = await apiUserClient.createUser({ username: nanoid() });
    const { socketDisconnected } = TestUtils.createUserSocketClient(server, nanoid(), userData.userID);
    await socketDisconnected;
  });
  it('Invalidates the user session after disconnection', async () => {
    // This test will timeout if it fails - it will never reach the expectation
    const userData = await apiUserClient.createUser({ username: nanoid() });
    const { socket, socketConnected } = TestUtils.createUserSocketClient(server, userData.userToken, userData.userID);
    await socketConnected;
    socket.disconnect();

    // Check if invalidated
    const { socket: secondTryWithSameToken, socketDisconnected: secondSocketDisconnected } = TestUtils.createUserSocketClient(server, userData.userToken, userData.userID);
    // Test if invalidated user is not able to reconnect
    await secondSocketDisconnected;
    expect(secondTryWithSameToken.disconnected).toBe(true);
    // Test if invalidated user is not able to be listed
    const userList = await apiUserClient.listUsers();
    expect(userList.users.find(user => user.userID === userData.userID)).toBeUndefined();
  });
  describe('InviteAsInsideUser', () => {
    let userData: { username: string, userID: string, userToken: string };
    let townData: { coveyTownID: string, coveyTownPassword: string };

    beforeAll(async () => {
      userData = await apiUserClient.createUser({ username: nanoid() });
      townData = await apiTownClient.createTown({ friendlyName: nanoid(), isPubliclyListed: true });
    });
    it('Town ID in an invitation should refer to an existing town.', async () => {
      try {
        await apiUserClient.inviteUserInSystem({
          invitedUserID: userData.userID,
          coveyTownID: nanoid(),
        });
        fail('Sent an invitation from non-existing room!');
      } catch (err) {
        /* Inviting a user with non-existing room ID. Expected. */
      }
    });
    it('An invitation should be sent to existing user in the system.', async () => {
      try {
        await apiUserClient.inviteUserInSystem({
          invitedUserID: nanoid(),
          coveyTownID: townData.coveyTownID,
        });
        fail('Sent an invitation to a nonsense!');
      } catch (err) {
        /* Inviting a non-existing user. Expected. */
      }
    });
    it('Be able to receive invitation from valid towns', async () => {
      // Make a valid user socket
      const { socketConnected, invitationReceived } = TestUtils.createUserSocketClient(server, userData.userToken, userData.userID);
      await socketConnected;
    
      // Receive invitation from a valid town
      await apiUserClient.inviteUserInSystem({
        invitedUserID: userData.userID,
        coveyTownID: townData.coveyTownID,
      });
      expect((await invitationReceived).coveyTownID).toEqual(townData.coveyTownID);
    });
  });
});
