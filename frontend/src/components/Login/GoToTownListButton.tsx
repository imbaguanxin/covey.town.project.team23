import { Button } from '@chakra-ui/react';
import React from 'react';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';

interface LogoutProps {
  goTownList: () => Promise<boolean>;
}

export default function GoToTownListButton({ goTownList }: LogoutProps): JSX.Element {
  const { room } = useVideoContext();
  const { sessionToken } = useCoveyAppState();

  return (
    <Button
      data-testid='gototownlist'
      colorScheme='blue'
      onClick={async () => {
        if (sessionToken.length > 0) {
          await room.disconnect();
          await goTownList();
        }
      }}>
      Town List
    </Button>
  );
}
