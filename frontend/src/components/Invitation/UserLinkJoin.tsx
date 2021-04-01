import React, {useCallback, useEffect, useState} from 'react';
import { useHistory } from 'react-router-dom';
import {
  Box,
  Button,
  Center,
  Container,
  Heading,
  Input,
  SimpleGrid,
  Stack,
  Text,
  useToast
} from '@chakra-ui/react';
import assert from 'assert';

import {CreateUserBodyResponse, TownJoinResponse} from '../../classes/ServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';
import Video from '../../classes/Video/Video';

interface UserLinkJoinProps {
  userLogin: (initData: CreateUserBodyResponse) => Promise<boolean>;
  townLogin: (initData: TownJoinResponse) => Promise<boolean>;
  params: { invitationToken: string };
}

export default function UserLinkJoin({userLogin, townLogin, params}: UserLinkJoinProps): JSX.Element {
  const [newUserName, setNewUserName] = useState<string>('');
  const [invitedTownID, setInvitedTownID] = useState<string>('');
  const [invitedTownName, setInvitedTownName] = useState<string>('');
  const history = useHistory();
  const {invitationSocket, townSocket, apiClient} = useCoveyAppState();
  const {connect} = useVideoContext();
  const toast = useToast();

  const getTownInfo = useCallback(async () => {
    try {
      const {coveyTownID, friendlyName} = await apiClient.joinUsingUrl({invitationID: params.invitationToken});
      setInvitedTownID(coveyTownID);
      setInvitedTownName(friendlyName);
    } catch (err) {
      toast({
        title: `Please check your token: ${params.invitationToken}`,
        description: err.toString(),
        status: 'error',
      });
    }
  }, [params.invitationToken, toast, apiClient]);

  useEffect(() => {
    getTownInfo();
  }, [getTownInfo, apiClient]);

  const handleJoin = useCallback(
    async (userName: string) => {
      try {
        const createUserRes = await apiClient.createUser({username: userName});
        await userLogin(createUserRes);

        const joinRoomRes = await Video.setup(userName, invitedTownID);
        const loggedIn = await townLogin(joinRoomRes);
        if (loggedIn) {
          assert(joinRoomRes.providerVideoToken);
          await connect(joinRoomRes.providerVideoToken);
        }
      } catch (err) {
        invitationSocket?.disconnect();
        townSocket?.disconnect();
        toast({
          title: `Unable to create user: ${userName} at room ${invitedTownName}`,
          description: err.toString(),
          status: 'error',
        });
      }
      history.push('/');
    },
    [
      connect,
      invitedTownID,
      invitedTownName,
      invitationSocket,
      townSocket,
      userLogin,
      townLogin,
      toast,
      apiClient,
      history,
    ],
  );

  return (
    <Center>
      <Box>
        <Container as={SimpleGrid} maxW='7xl' columns={{base: 1, md: 1}} spacing={{base: 10, lg: 32}}
                   py={{base: 10, sm: 20, lg: 32}}>
          <Stack bg='gray.50' rounded='xl' p={{base: 4, sm: 6, md: 8}} spacing={{base: 8}} maxW={{lg: 'lg'}}>
            <Stack spacing={4}>
              <Heading color='gray.800' lineHeight={1.1} fontSize={{base: '2xl', sm: '3xl', md: '4xl'}}>
                Welcome to {invitedTownName}
                <Text as='span' bgGradient='linear(to-r, red.400,pink.400)' bgClip='text'>
                  !
                </Text>
              </Heading>
              <Heading color='gray.800' lineHeight={1.1} fontSize={{base: '2l', sm: '3l', md: '4l'}}>
                Select your name to let people know who you are.
              </Heading>
              <Text color='gray.500' fontSize={{base: 'sm', sm: 'md'}}>
                Covey.Town is a social platform that integrates a 2D game-like metaphor with video chat. To get started,
                setup your camera and microphone, choose a username, and then create a new town
                to hang out in, or join an existing one.
              </Text>
            </Stack>
            <Box as='form' mt={10}>
              <Stack spacing={4}>
                <Input
                  placeholder='Enter username'
                  bg='gray.100'
                  border={0}
                  color='gray.500'
                  _placeholder={{
                    color: 'gray.500',
                  }}
                  value={newUserName}
                  onChange={event => setNewUserName(event.target.value)}
                />
              </Stack>
              <Button
                fontFamily='heading'
                mt={8}
                w='full'
                bgGradient='linear(to-r, red.400,pink.400)'
                color='white'
                onClick={() => handleJoin(newUserName)}
                _hover={{
                  bgGradient: 'linear(to-r, red.400,pink.400)',
                  boxShadow: 'xl',
                }}>
                Create
              </Button>
            </Box>
            form
          </Stack>
        </Container>
      </Box>
    </Center>
  );
}
