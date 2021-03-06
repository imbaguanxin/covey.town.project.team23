import { Socket } from 'socket.io-client';
import Player, { UserLocation } from './classes/Player';
import ServiceClient from './classes/ServiceClient';

export type CoveyEvent = 'playerMoved' | 'playerAdded' | 'playerRemoved';

export type VideoRoom = {
  twilioID: string;
  id: string;
};
export type UserProfile = {
  displayName: string;
  id: string;
};
export type NearbyPlayers = {
  nearbyPlayers: Player[];
};
export type CoveyAppState = {
  sessionToken: string;
  userName: string;
  myUserID: string;
  myUserToken: string;
  currentTownFriendlyName: string;
  currentTownID: string;
  currentTownIsPubliclyListed: boolean;
  myPlayerID: string;
  players: Player[];
  currentLocation: UserLocation;
  nearbyPlayers: NearbyPlayers;
  emitMovement: (location: UserLocation) => void;
  townSocket: Socket | null;
  invitationSocket: Socket | null;
  invitations: { coveyTownID: string; friendlyName: string }[];
  apiClient: ServiceClient;
};
