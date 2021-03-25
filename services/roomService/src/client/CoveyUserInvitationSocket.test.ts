import CORS from 'cors';
import Express from 'express';
import http from 'http'
import io from 'socket.io';
import { nanoid } from 'nanoid';
import { AddressInfo } from 'net';
import UsersInvitationClient from './UsersInvitationClient';
import TownsServiceClient from './TownsServiceClient';
import addUserInvitationRoutes from '../router/userInvitations';
import * as TestUtils from './TestUtils';
import addTownRoutes from '../router/towns';

describe('UserServiceApiSocket', () => {
    let server: http.Server;
    let apiUserClient: UsersInvitationClient;
    let apiTownClient: TownsServiceClient;

    let socketServer: io.Server;
    beforeAll(async () => {
        const app = Express();
        app.use(CORS());
        server = http.createServer(app);

        addTownRoutes(server, app);
        socketServer = addUserInvitationRoutes(server, app);
        server.listen();
        const address = server.address() as AddressInfo;

        const testUrl = `http://127.0.0.1:${address.port}`
        apiUserClient = new UsersInvitationClient(testUrl);
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
        const { socketDisconnected } = TestUtils.createUserSocketClient(
            server,
            userData.userToken,
            nanoid(),
        );
        await socketDisconnected;
    });
    it('Rejects invalid userToken, even if otherwise valid userID', async () => {
        const userData = await apiUserClient.createUser({ username: nanoid() });
        const { socketDisconnected } = TestUtils.createUserSocketClient(
            server,
            nanoid(),
            userData.userID,
        );
        await socketDisconnected;
    });
    it('Invalidates the user session after disconnection', async () => {
        // This test will timeout if it fails - it will never reach the expectation
        const userData = await apiUserClient.createUser({ username: nanoid() });
        const { socket, socketConnected } = TestUtils.createUserSocketClient(
            server,
            userData.userToken,
            userData.userID,
        );
        await socketConnected;
        socket.disconnect();

        // Check if invalidated
        const {
            socket: secondTryWithSameToken,
            socketDisconnected: secondSocketDisconnected,
        } = TestUtils.createUserSocketClient(server, userData.userToken, userData.userID);
        // Test if invalidated user is not able to reconnect
        await secondSocketDisconnected;
        expect(secondTryWithSameToken.disconnected).toBe(true);
        // Test if invalidated user is not able to be listed
        const userList = await apiUserClient.listUsers();
        expect(userList.users.find(user => user.userID === userData.userID)).toBeUndefined();
    });
    it('Be able to receive invitation from valid towns', async () => {
        // Make a valid user
        const userData = await apiUserClient.createUser({ username: nanoid() });
        const { socket, socketConnected, invitationReceived } = TestUtils.createUserSocketClient(
            server,
            userData.userToken,
            userData.userID,
        );
        await socketConnected;

        // Make a valid town
        const townData = await apiTownClient.createTown({
            friendlyName: nanoid(),
            isPubliclyListed: true,
        });

        // Receive invitation from a valid town
        const res = await apiUserClient.inviteUserInSystem({
            invitedUserID: userData.userID,
            coveyTownID: townData.coveyTownID,
        });
        expect(res.invitationSent).toBeTruthy();
        expect(await invitationReceived).toEqual(townData.coveyTownID);
    });
});