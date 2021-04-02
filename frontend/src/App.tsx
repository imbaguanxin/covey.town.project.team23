import { ChakraProvider } from '@chakra-ui/react';
import { MuiThemeProvider } from '@material-ui/core/styles';
import assert from 'assert';
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import './App.css';
import Player, { ServerPlayer, UserLocation } from './classes/Player';
import ServiceClient, { CreateUserBodyResponse, TownJoinResponse } from './classes/ServiceClient';
import Video from './classes/Video/Video';
import UserInvitation from './components/Invitation/UserInvitation';
import UserLinkJoin from './components/Invitation/UserLinkJoin';
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
  | { action: 'receivedInvitation'; coveyTownID: string; friendlyName: string }
  // | { action: 'acceptInvitation'; coveyTownID: string }
  | { action: 'deleteInvitation'; coveyTownID: string };

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
      break;
    // TODO 'receivedInvitation'
    case 'receivedInvitation':
      if (nextState.currentTownID !== update.coveyTownID) {
        if (!nextState.invitations.find(town => town.coveyTownID === update.coveyTownID)) {
          nextState.invitations.push({ coveyTownID: update.coveyTownID, friendlyName: update.friendlyName });
        }
      }
      break;
    // TODO 'denyInvitation'
    case 'deleteInvitation':
      nextState.invitations = nextState.invitations.filter(town => town.coveyTownID !== update.coveyTownID);
      break;
    default:
      throw new Error('Unexpected state request');
  }

  return nextState;
}

async function loginController(initData: CreateUserBodyResponse, dispatchAppUpdate: (update: CoveyAppUpdate) => void) {
  const { username, userID, userToken } = initData;
  const url = process.env.REACT_APP_TOWNS_SERVICE_URL;
  assert(url);

  const socket = io(url, { path: '/user', auth: { token: userToken, userID } });

  socket.on('invitedToTown', (invitation: { coveyTownID: string; friendlyName: string }) => {
    dispatchAppUpdate({
      action: 'receivedInvitation',
      coveyTownID: invitation.coveyTownID,
      friendlyName: invitation.friendlyName,
    });
  });

  dispatchAppUpdate({
    action: 'login',
    data: { userName: username, userID, userToken, invitationSocket: socket },
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
    dispatchAppUpdate({ action: 'goRoomList' });
  });
  const emitMovement = (location: UserLocation) => {
    socket.emit('playerMovement', location);
    dispatchAppUpdate({ action: 'weMoved', location });
  };

  dispatchAppUpdate({
    action: 'doConnect',
    data: {
      sessionToken,
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
  const setupLoginController = useCallback(
    async (initData: CreateUserBodyResponse) => {
      await loginController(initData, dispatchAppUpdate);
      return true;
    },
    [dispatchAppUpdate],
  );

  const setLogout = useCallback(async () => {
    dispatchAppUpdate({ action: 'disconnect' });

    // Make sure to tear it down
    await Video.teardown();
    return true;
  }, [dispatchAppUpdate]);

  const setDeleteInvitation = useCallback(
    async (coveyTownID: string) => {
      async function deleteInvitation() {
        dispatchAppUpdate({ action: 'deleteInvitation', coveyTownID });
        return true;
      }
      await deleteInvitation();
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
      dispatchAppUpdate({ action: 'goRoomList' });
      return Video.teardown();
    });
  }, [dispatchAppUpdate, setOnDisconnect]);

  const page = useMemo(() => {
    if (!appState.myUserToken) {
      return (
        <div>
          <Route path='/' exact>
            <UserCreation doLogin={setupLoginController} />
          </Route>
          <Route path='/join/:invitationToken' render={prop => <UserLinkJoin userLogin={setupLoginController} townLogin={setupGameController} params={prop.match.params} />} />
        </div>
      );
    }
    if (!appState.sessionToken) {
      return (
        <div>
          <UserInvitation doLogin={setupGameController} doLogout={setLogout} deleteInvitation={setDeleteInvitation} />
          <Login doLogin={setupGameController} />
        </div>
      );
    }
    if (!videoInstance) {
      return <div>Loading...</div>;
    }
    return (
      <div>
        <UserInvitation doLogin={setupGameController} doLogout={setLogout} deleteInvitation={setDeleteInvitation} />
        <WorldMap />
        <VideoOverlay preferredMode='fullwidth' />
      </div>
    );
  }, [setupGameController, appState.myUserToken, appState.sessionToken, videoInstance, setLogout, setDeleteInvitation, setupLoginController]);
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
    <Router>
      <ChakraProvider>
        <MuiThemeProvider theme={theme('rgb(185, 37, 0)')}>
          <AppStateProvider preferredMode='fullwidth' highlightedProfiles={[]}>
            <EmbeddedTwilioAppWrapper />
          </AppStateProvider>
        </MuiThemeProvider>
      </ChakraProvider>
    </Router>
  );
}
