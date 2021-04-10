import { mock } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { Socket } from 'socket.io';
import CoveyInvitationListener from '../types/CoveyInvitationListener';
import CoveyTownsStore from './CoveyTownsStore';
import CoveyUserController from './CoveyUserController';

function createUserForTesting(usernameToUse?: string) {
  const username = usernameToUse !== undefined ? usernameToUse : `TestingUser=${nanoid()}`;
  return CoveyUserController.getInstance().createUser(username);
}

function createTownForTesting(friendlyNameToUse?: string, isPublic = false) {
  const friendlyName = friendlyNameToUse !== undefined ? friendlyNameToUse : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
  return CoveyTownsStore.getInstance().createTown(friendlyName, isPublic);
}

function createMockListener(userID: string): CoveyInvitationListener {
  const mockListener = {
    getUserID: () => userID,
    onInvited: jest.fn(),
    onDisconnect: jest.fn(),
  };
  CoveyUserController.getInstance().addListner(mockListener);
  return mockListener;
}

describe('CoveyUserController', () => {
  it('should be a singleton', () => {
    const store1 = CoveyUserController.getInstance();
    const store2 = CoveyUserController.getInstance();
    expect(store1).toBe(store2);
  });

  describe('getUserByID', () => {
    it('Should fail if the userID does not exist', async () => {
      const res = CoveyUserController.getInstance().getUserByID('');
      expect(res).toBe(undefined);
    });
    it('Should get the user with the correct userID', async () => {
      const user = createUserForTesting();
      const userResponse = CoveyUserController.getInstance().getUserByID(user.userID);
      expect(userResponse?.userID).toBe(user.userID);
      expect(userResponse?.username).toBe(user.username);
    });
  });

  describe('createUser', () => {
    it('Should allow multiple users with the same username', () => {
      const firstUser = createUserForTesting();
      const secondUser = createUserForTesting(firstUser.username);
      expect(firstUser).not.toBe(secondUser);
      expect(firstUser.username).toBe(secondUser.username);
      expect(firstUser.userID).not.toBe(secondUser.userID);
      expect(firstUser.userToken).not.toBe(secondUser.userToken);
    });
  });

  describe('deleteUser', () => {
    it('Should fail if the userID does not exist', async () => {
      const res = CoveyUserController.getInstance().deleteUser('');
      expect(res).toBe(false);
    });
    it('Should delete user according user', async () => {
      const user1 = createUserForTesting('user1');
      const user2 = createUserForTesting('user2');
      const userController = CoveyUserController.getInstance();
      userController.deleteUser(user1.userID);
      const userIDList = userController.getUsers().map(user => user.userID);
      expect(userIDList).toContain(user2.userID);
      expect(userIDList).not.toContain(user1.userID);
    });
  });

  describe('inviteUser', () => {
    it('Should fail if the userID does not exist', async () => {
      const town = createTownForTesting();
      const res = CoveyUserController.getInstance().inviteUser('', town.coveyTownID);
      expect(res).toBe(false);
    });
    it('Should notify the according user if the user if exists', async () => {
      const town = createTownForTesting();
      const user1 = createUserForTesting('user1');
      const listener1 = createMockListener(user1.userID);
      const user2 = createUserForTesting('user2');
      const listener2 = createMockListener(user2.userID);

      const userController = CoveyUserController.getInstance();
      userController.inviteUser(user1.userID, town.coveyTownID);
      expect(listener1.onInvited).toBeCalledWith(town.coveyTownID, town.friendlyName);
      expect(listener2.onInvited).not.toBeCalled();
    });
  });

  describe('listUsers', () => {
    it('Should include newly added users', async () => {
      const user = createUserForTesting();
      const users = CoveyUserController.getInstance().getUsers();
      const entry = users.filter(userInfo => userInfo.userID === user.userID);
      expect(entry.length).toBe(1);
      expect(entry[0].username).toBe(user.username);
      expect(entry[0].userID).toBe(user.userID);
    });
    it('Should include each userID if there are multiple users with the same username', async () => {
      const firstUser = createUserForTesting();
      const secondUser = createUserForTesting(firstUser.username);
      const users = CoveyUserController.getInstance()
        .getUsers()
        .filter(userInfo => userInfo.username === firstUser.username);
      expect(users.length).toBe(2);
      expect(users[0].username).toBe(firstUser.username);
      expect(users[1].username).toBe(firstUser.username);

      if (users[0].userID === firstUser.userID) {
        expect(users[1].userID).toBe(secondUser.userID);
      } else if (users[1].userID === firstUser.userID) {
        expect(users[0].userID).toBe(firstUser.userID);
      } else {
        fail('Expected the userIDs to match the users that were created');
      }
    });
    it('Should not include deleted users', async () => {
      const user = createUserForTesting();
      const userIDs = CoveyUserController.getInstance()
        .getUsers()
        .map(u => u.userID);
      expect(userIDs).toContain(user.userID);

      const res = CoveyUserController.getInstance().deleteUser(user.userID);
      expect(res).toBe(true);

      const usersPostDelete = CoveyUserController.getInstance()
        .getUsers()
        .map(u => u.userID);
      expect(usersPostDelete).not.toContain(user.userID);
    });
  });

  describe('connect', () => {
    it('should not connect if the userID is not correct', async () => {
      const user1 = createUserForTesting();
      const mockSocket = mock<Socket>();
      CoveyUserController.getInstance().connect(nanoid(), user1.userToken, mockSocket);
      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
    it('should not connect if the userToken is not correct', async () => {
      const user1 = createUserForTesting();
      const mockSocket = mock<Socket>();
      CoveyUserController.getInstance().connect(user1.userID, nanoid(), mockSocket);
      expect(mockSocket.disconnect).toBeCalledWith(true);
    });
  });
});
