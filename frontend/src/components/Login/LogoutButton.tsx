import React from 'react';

import { Button } from '@chakra-ui/react';

import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import useCoveyAppState from '../../hooks/useCoveyAppState';

interface LogoutProps {
  doLogout: () => Promise<boolean>;
}

export default function LogoutButton({ doLogout }: LogoutProps): JSX.Element {
  const { room } = useVideoContext();
  const { sessionToken } = useCoveyAppState();

  return (
    <Button data-testid='logoutButton'
            colorScheme='red'
            mr={3}
            value='logout'
            name='action1'
            onClick={async () => {
      if (sessionToken.length > 0) {
        await room.disconnect();
      }
      await doLogout();
    }}>
      Log Out
    </Button>
  );
}
