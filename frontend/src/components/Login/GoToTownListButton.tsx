import { Button } from '@chakra-ui/react';
import React from 'react';
import useRoomState from '../VideoCall/VideoFrontend/hooks/useRoomState/useRoomState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';

export default function GoToTownListButton(): JSX.Element {
  const { room } = useVideoContext();
  const roomState = useRoomState();

  return (
    <Button
      data-testid='gototownlist'
      colorScheme='blue'
      disabled={roomState === 'disconnected'}
      onClick={async () => {
        await room.disconnect();
      }}>
      Town List
    </Button>
  );
}
