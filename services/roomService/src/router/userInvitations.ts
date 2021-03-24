import BodyParser from 'body-parser';
import { Express } from 'express';
import { Server } from 'http';
import { StatusCodes } from 'http-status-codes';
import io from 'socket.io';
import {
  getInvitationLinkHandler,
  inviteUserInSystemHandler,
  joinLinkHandler,
  userCreateHandler,
  userListHandler,
  userSubscriptionHandler,
} from '../requestHandlers/UserInvitationRequestHandlers';
import { logError } from '../Utils';

export default function addUserInvitationRoutes(http: Server, app: Express): io.Server {
  /*
   * list users
   */
  app.get('/user', BodyParser.json(), async (_req, res) => {
    try {
      const result = await userListHandler();
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * TODO
   * Create a user
   */
  app.post('/user', BodyParser.json(), async (req, res) => {
    try {
      const result = await userCreateHandler({ username: req.body.username });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Get the invitationID of a town
   */
  app.get('/invitation/:townID', BodyParser.json(), async (req, res) => {
    try {
      const result = await getInvitationLinkHandler({ coveyTownID: req.params.townID });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * join as a outside user
   */
  app.get('/joinInvitation/:invitationID', BodyParser.json(), async (req, res) => {
    try {
      const result = await joinLinkHandler({ invitationID: req.params.invitationID });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  /**
   * Invite In system user
   */
  app.post('/invitation', BodyParser.json(), async (req, res) => {
    try {
      const result = await inviteUserInSystemHandler({
        invitedUserID: req.body.invitedUserID,
        coveyTownID: req.body.conveyTownID,
      });
      res.status(StatusCodes.OK).json(result);
    } catch (err) {
      logError(err);
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error, please see log in server for more details',
      });
    }
  });

  const socketServer = new io.Server(http, { cors: { origin: '*' } });
  socketServer.on('connection', userSubscriptionHandler);
  return socketServer;
}
