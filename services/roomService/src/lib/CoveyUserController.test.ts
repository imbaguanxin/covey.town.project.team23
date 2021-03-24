import { nanoid } from 'nanoid';
import CoveyInvitationListener from '../types/CoveyInvitationListener';
import CoveyTownsStore from './CoveyTownsStore';
import CoveyUserController from './CoveyUserController';

const mockInvitationListenerFns = jest.fn();

function mockInvitationListener(): CoveyInvitationListener {
  return {
    getUserID(): string {
      mockInvitationListenerFns();
      return '';
    },
    onInvited(coveyTownID: string): void {
      mockInvitationListenerFns(coveyTownID);
    },
    onDisconnect() {
      mockInvitationListenerFns();
    },
  };
}

function createUserForTesting(usernameToUse?: string) {
  const username = usernameToUse !== undefined ? usernameToUse : `TestingUser=${nanoid()}`;
  return CoveyUserController.getInstance().createUser(username);
}

function createTownForTesting(friendlyNameToUse?: string, isPublic = false) {
  const friendlyName =
    friendlyNameToUse !== undefined
      ? friendlyNameToUse
      : `${isPublic ? 'Public' : 'Private'}TestingTown=${nanoid()}`;
  return CoveyTownsStore.getInstance().createTown(friendlyName, isPublic);
}

describe('CoveyUserController', () => {
  beforeEach(() => {
    mockInvitationListenerFns.mockClear();
  });
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
    // it('Should get the user with the correct userID', async () => {
    //   const user = createUserForTesting();
    //   const res = CoveyUserController.getInstance().getUserByID(user.userID);
    //   console.log(res);
    //   expect(res.userID).toBe(user.userID);
    //   expect(res.username).toBe(user.username);
    // });
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
  });

    describe('inviteUser', () => {
      it('Should fail if the userID does not exist', async () => {
        const town = createTownForTesting();
        const res = CoveyUserController.getInstance().inviteUser('', town.coveyTownID);
        expect(res).toBe(false);
      });
    });

  describe('listUsers', () => {
    it('Should include all users', async () => {
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
        console.log(user);
        console.log(CoveyUserController.getInstance().getUsers());
        const users = CoveyUserController.getInstance()
          .getUsers()
          .filter(
            userInfo =>
              userInfo.username === user.username ||
              userInfo.userID === user.userID,
          );
        expect(users.length).toBe(1);
        const res = CoveyUserController.getInstance().deleteUser(
          user.userID
        );
        expect(res).toBe(true);
        console.log(CoveyUserController.getInstance().getUsers());
        const usersPostDelete = CoveyUserController.getInstance()
          .getUsers()
          .filter(
            userInfo =>
              userInfo.username === user.username ||
              userInfo.userID === user.userID,
          );
        expect(usersPostDelete.length).toBe(0);
      });
  });
});
