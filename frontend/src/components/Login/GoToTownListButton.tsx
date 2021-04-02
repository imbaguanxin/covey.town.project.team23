import { Button } from '@chakra-ui/react';
import React from 'react';
import useRoomState from '../VideoCall/VideoFrontend/hooks/useRoomState/useRoomState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';

interface LogoutProps {
  goTownList: () => Promise<boolean>;
}

export default function GoToTownListButton({ goTownList }: LogoutProps): JSX.Element {
  const { room } = useVideoContext();
  const roomState = useRoomState();

  return (
    <Button
      data-testid='gototownlist'
      colorScheme='blue'
      disabled={roomState === 'disconnected'}
      onClick={async () => {
        await room.disconnect();
        // await goTownList();
      }}>
      Town List
    </Button>
  );
}
