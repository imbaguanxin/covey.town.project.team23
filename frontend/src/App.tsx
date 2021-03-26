import { ChakraProvider } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import assert from 'assert';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Player, { ServerPlayer, UserLocation } from './classes/Player';
import ServiceClient, { CreateUserBodyResponse, TownJoinResponse } from './classes/ServiceClient';
import Video from './classes/Video/Video';
import UserInvitation from './components/Invitation/UserInvitation';
import Login from './components/Login/Login';
import UserCreation from './components/Login/UserCreation';
import ErrorDialog from './components/VideoCall/VideoFrontend/components/ErrorDialog/ErrorDialog';
import UnsupportedBrowserWarning from './components/VideoCall/VideoFrontend/components/UnsupportedBrowserWarning/UnsupportedBrowserWarning';
import { VideoProvider } from './components/VideoCall/VideoFrontend/components/VideoProvider';
import AppStateProvider, { useAppState } from './components/VideoCall/VideoFrontend/state';
import theme from './components/VideoCall/VideoFrontend/theme';
import { Callback } from './components/VideoCall/VideoFrontend/types';
import useConnectionOptions from './components/VideoCall/VideoFrontend/utils/useConnectionOptions/useConnectionOptions';
import VideoOverlay from './components/VideoCall/VideoOverlay/VideoOverlay';
import WorldMap from './components/world/WorldMap';
import CoveyAppContext from './contexts/CoveyAppContext';
import NearbyPlayersContext from './contexts/NearbyPlayersContext';
import VideoContext from './contexts/VideoContext';
import { CoveyAppState, NearbyPlayers } from './CoveyTypes';

type CoveyAppUpdate =
  | {
      action: 'doConnect';
      data: {
        townFriendlyName: string;
        townID: string;
        townIsPubliclyListed: boolean;
        sessionToken: string;
        myPlayerID: string;
        townSocket: Socket;
        players: Player[];
        emitMovement: (location: UserLocation) => void;
      };
    }
  | { action: 'addPlayer'; player: Player }
  | { action: 'playerMoved'; player: Player }
  | { action: 'playerDisconnect'; player: Player }
  | { action: 'weMoved'; location: UserLocation }
  | { action: 'goRoomList' }
  | { action: 'disconnect' }
  | { action: 'login'; data: { userName: string; userID: string; userToken: string; invitationSocket: Socket } }
  | { action: 'receivedInvitation'; coveyTownID: string }
  // AccceptInvitation similar to do connect?
  | {
      action: 'acceptInvitation';
      data: {
        townFriendlyName: string;
        townID: string;
        townIsPubliclyListed: boolean;
        sessionToken: string;
        myPlayerID: string;
        townSocket: Socket;
        players: Player[];
        emitMovement: (location: UserLocation) => void;
      };
    }
  // | { action: 'acceptInvitation'; coveyTownID: string }
  | { action: 'denyInvitation'; coveyTownID: string };

function goRoomListState(oldState: CoveyAppState): CoveyAppState {
  return {
    nearbyPlayers: { nearbyPlayers: [] },
    players: [],
    myPlayerID: '',
    currentTownFriendlyName: '',
    currentTownID: '',
    currentTownIsPubliclyListed: false,
    sessionToken: '',
    userName: oldState.userName,
    myUserID: oldState.myUserID,
    myUserToken: oldState.myUserToken,
    townSocket: null,
    invitationSocket: oldState.invitationSocket,
    invitations: oldState.invitations,
    currentLocation: {
      x: 0,
      y: 0,
      rotation: 'front',
      moving: false,
    },
    emitMovement: () => {},
    apiClient: new ServiceClient(),
  };
}

function defaultAppState(): CoveyAppState {
  return {
    nearbyPlayers: { nearbyPlayers: [] },
    players: [],
    myPlayerID: '',
    currentTownFriendlyName: '',
    currentTownID: '',
    currentTownIsPubliclyListed: false,
    sessionToken: '',
    userName: '',
    myUserID: '',
    myUserToken: '',
    townSocket: null,
    invitationSocket: null,
    invitations: [],
    currentLocation: {
      x: 0,
      y: 0,
      rotation: 'front',
      moving: false,
    },
    emitMovement: () => {},
    apiClient: new ServiceClient(),
  };
}
function appStateReducer(state: CoveyAppState, update: CoveyAppUpdate): CoveyAppState {
  const nextState = {
    userName: state.userName,
    myUserID: state.myUserID,
    myUserToken: state.myUserToken,
    sessionToken: state.sessionToken,
    currentTownFriendlyName: state.currentTownFriendlyName,
    currentTownID: state.currentTownID,
    currentTownIsPubliclyListed: state.currentTownIsPubliclyListed,
    myPlayerID: state.myPlayerID,
    players: state.players,
    currentLocation: state.currentLocation,
    nearbyPlayers: state.nearbyPlayers,
    townSocket: state.townSocket,
    invitationSocket: state.invitationSocket,
    emitMovement: state.emitMovement,
    apiClient: state.apiClient,
    invitations: state.invitations,
  };

  function calculateNearbyPlayers(players: Player[], currentLocation: UserLocation) {
    const isWithinCallRadius = (p: Player, location: UserLocation) => {
      if (p.location && location) {
        const dx = p.location.x - location.x;
        const dy = p.location.y - location.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        return d < 80;
      }
      return false;
    };
    return { nearbyPlayers: players.filter(p => isWithinCallRadius(p, currentLocation)) };
  }

  function samePlayers(a1: NearbyPlayers, a2: NearbyPlayers) {
    if (a1.nearbyPlayers.length !== a2.nearbyPlayers.length) return false;
    const ids1 = a1.nearbyPlayers.map(p => p.id).sort();
    const ids2 = a2.nearbyPlayers.map(p => p.id).sort();
    return !ids1.some((val, idx) => val !== ids2[idx]);
  }

  let updatePlayer;
  switch (update.action) {
    case 'doConnect':
      nextState.sessionToken = update.data.sessionToken;
      nextState.myPlayerID = update.data.myPlayerID;
      nextState.currentTownFriendlyName = update.data.townFriendlyName;
      nextState.currentTownID = update.data.townID;
      nextState.currentTownIsPubliclyListed = update.data.townIsPubliclyListed;
      // nextState.userName = update.data.userName;
      nextState.emitMovement = update.data.emitMovement;
      nextState.townSocket = update.data.townSocket;
      nextState.players = update.data.players;
      break;
    case 'addPlayer':
      nextState.players = nextState.players.concat([update.player]);
      break;
    case 'playerMoved':
      updatePlayer = nextState.players.find(p => p.id === update.player.id);
      if (updatePlayer) {
        updatePlayer.location = update.player.location;
      } else {
        nextState.players = nextState.players.concat([update.player]);
      }
      nextState.nearbyPlayers = calculateNearbyPlayers(nextState.players, nextState.currentLocation);
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'weMoved':
      nextState.currentLocation = update.location;
      nextState.nearbyPlayers = calculateNearbyPlayers(nextState.players, nextState.currentLocation);
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }

      break;
    case 'playerDisconnect':
      nextState.players = nextState.players.filter(player => player.id !== update.player.id);

      nextState.nearbyPlayers = calculateNearbyPlayers(nextState.players, nextState.currentLocation);
      if (samePlayers(nextState.nearbyPlayers, state.nearbyPlayers)) {
        nextState.nearbyPlayers = state.nearbyPlayers;
      }
      break;
    case 'disconnect':
      state.townSocket?.disconnect();
      state.invitationSocket?.disconnect();
      return defaultAppState();

    case 'goRoomList':
      state.townSocket?.disconnect();
      return goRoomListState(nextState);
    // TODO 'login'
    case 'login':
      nextState.myUserID = update.data.userID;
      nextState.myUserToken = update.data.userToken;
      nextState.userName = update.data.userName;
      nextState.invitationSocket = update.data.invitationSocket;
      // throw new Error('Unimplemented');
      break;
    // TODO 'receivedInvitation'
    case 'receivedInvitation':
      nextState.invitations.push(update.coveyTownID);
      break;
    // TODO 'acceptInvitation'
    case 'acceptInvitation':
      nextState.invitations = nextState.invitations.filter(id => id !== update.data.townID);
      nextState.sessionToken = update.data.sessionToken;
      nextState.myPlayerID = update.data.myPlayerID;
      nextState.currentTownFriendlyName = update.data.townFriendlyName;
      nextState.currentTownID = update.data.townID;
      nextState.currentTownIsPubliclyListed = update.data.townIsPubliclyListed;
      nextState.emitMovement = update.data.emitMovement;
      nextState.townSocket = update.data.townSocket;
      nextState.players = update.data.players;
      // throw new Error('Unimplemented');
      break;
    // TODO 'denyInvitation'
    case 'denyInvitation':
      nextState.invitations.filter(id => id !== update.coveyTownID);
      // throw new Error('Unimplemented');
      break;
    default:
      throw new Error('Unexpected state request');
  }

  return nextState;
}

// TODO: userInvitation controller
async function invitationController(initData: CreateUserBodyResponse, dispatchAppUpdate: (update: CoveyAppUpdate) => void) {
  const username = initData.username;
  const userID = initData.userID;
  const token = initData.userToken;
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  assert(url);

  const socket = io(url, { path: '/user', auth: { token: token, userID: userID } });

  socket.on('invitedToTown', (townID: string) => {
    dispatchAppUpdate({
      action: 'receivedInvitation',
      coveyTownID: townID,
    });
  });

  dispatchAppUpdate({
    action: 'login',
    data: { userName: username, userID: userID, userToken: token, invitationSocket: socket },
  });

  return true;
}

async function GameController(initData: TownJoinResponse, dispatchAppUpdate: (update: CoveyAppUpdate) => void) {
  // Now, set up the game sockets
  const gamePlayerID = initData.coveyUserID;
  const sessionToken = initData.coveySessionToken;
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  assert(url);
  const video = Video.instance();
  assert(video);
  const townName = video.townFriendlyName;
  assert(townName);

  const socket = io(url, { path: '/town', auth: { token: sessionToken, coveyTownID: video.coveyTownID } });
  socket.on('newPlayer', (player: ServerPlayer) => {
    dispatchAppUpdate({
      action: 'addPlayer',
      player: Player.fromServerPlayer(player),
    });
  });
  socket.on('playerMoved', (player: ServerPlayer) => {
    if (player._id !== gamePlayerID) {
      dispatchAppUpdate({ action: 'playerMoved', player: Player.fromServerPlayer(player) });
    }
  });
  socket.on('playerDisconnect', (player: ServerPlayer) => {
    dispatchAppUpdate({ action: 'playerDisconnect', player: Player.fromServerPlayer(player) });
  });
  socket.on('disconnect', () => {
    dispatchAppUpdate({ action: 'disconnect' });
  });
  const emitMovement = (location: UserLocation) => {
    socket.emit('playerMovement', location);
    dispatchAppUpdate({ action: 'weMoved', location });
  };

  dispatchAppUpdate({
    action: 'doConnect',
    data: {
      sessionToken,
      // userName: video.userName,
      townFriendlyName: townName,
      townID: video.coveyTownID,
      myPlayerID: gamePlayerID,
      townIsPubliclyListed: video.isPubliclyListed,
      emitMovement,
      townSocket: socket,
      players: initData.currentPlayers.map(sp => Player.fromServerPlayer(sp)),
    },
  });
  return true;
}

function App(props: { setOnDisconnect: Dispatch<SetStateAction<Callback | undefined>> }) {
  const [appState, dispatchAppUpdate] = useReducer(appStateReducer, defaultAppState());
  // TODO : setup invitation controller
  const setupInvitationController = useCallback(
    async (initData: CreateUserBodyResponse) => {
      await invitationController(initData, dispatchAppUpdate);
      return true;
    },
    [dispatchAppUpdate],
  );

  const setupGameController = useCallback(
    async (initData: TownJoinResponse) => {
      await GameController(initData, dispatchAppUpdate);
      return true;
    },
    [dispatchAppUpdate],
  );
  const videoInstance = Video.instance();

  const { setOnDisconnect } = props;
  useEffect(() => {
    setOnDisconnect(() => async () => {
      // Here's a great gotcha: https://medium.com/swlh/how-to-store-a-function-with-the-usestate-hook-in-react-8a88dd4eede1
      dispatchAppUpdate({ action: 'disconnect' });
      return Video.teardown();
    });
  }, [dispatchAppUpdate, setOnDisconnect]);

  const page = useMemo(() => {
    // TODO : setup invitation controller
    if (!appState.myUserToken) {
      return <UserCreation doLogin={setupInvitationController} />;
    }
    if (!appState.sessionToken) {
      return (
        <div>
          <UserInvitation doLogin={setupGameController} />
          <Login doLogin={setupGameController} />
        </div>
      );
    }
    if (!videoInstance) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <UserInvitation doLogin={setupGameController} />
        <WorldMap />
        <VideoOverlay preferredMode='fullwidth' />
      </div>
    );
  }, [setupGameController, appState.sessionToken, videoInstance]);
  return (
    <CoveyAppContext.Provider value={appState}>
      <VideoContext.Provider value={Video.instance()}>
        <NearbyPlayersContext.Provider value={appState.nearbyPlayers}>{page}</NearbyPlayersContext.Provider>
      </VideoContext.Provider>
    </CoveyAppContext.Provider>
  );
}

function EmbeddedTwilioAppWrapper() {
  const { error, setError } = useAppState();
  const [onDisconnect, setOnDisconnect] = useState<Callback | undefined>();
  const connectionOptions = useConnectionOptions();
  return (
    <UnsupportedBrowserWarning>
      <VideoProvider options={connectionOptions} onError={setError} onDisconnect={onDisconnect}>
        <ErrorDialog dismissError={() => setError(null)} error={error} />
        <App setOnDisconnect={setOnDisconnect} />
      </VideoProvider>
    </UnsupportedBrowserWarning>
  );
}

export default function AppStateWrapper(): JSX.Element {
  return (
    <BrowserRouter>
      <ChakraProvider>
        <MuiThemeProvider theme={theme('rgb(185, 37, 0)')}>
          <AppStateProvider preferredMode='fullwidth' highlightedProfiles={[]}>
            <EmbeddedTwilioAppWrapper />
          </AppStateProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </BrowserRouter>
  );
}
