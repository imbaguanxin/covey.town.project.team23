import React from 'react';

import { Button } from '@chakra-ui/react';

import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useRoomState from '../VideoCall/VideoFrontend/hooks/useRoomState/useRoomState';

interface LogoutProps {
  doLogout: () => Promise<boolean>;
}

export default function LogoutButton({ doLogout }: LogoutProps): JSX.Element {
  const { room } = useVideoContext();
  const roomState = useRoomState();
  const { sessionToken } = useCoveyAppState();

  return (
    <Button
      data-testid='logoutButton'
      colorScheme='red'
      mr={3}
      value='logout'
      name='action1'
      disabled={roomState === 'disconnected' && sessionToken.length > 0}
      onClick={async () => {
        if (roomState !== 'disconnected') {
          await room.disconnect();
        }
        await doLogout();
      }}>
      Log Out
    </Button>
  );
}
