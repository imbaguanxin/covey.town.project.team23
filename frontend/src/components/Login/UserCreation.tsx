import { Box, Button, Center, Container, Heading, Input, SimpleGrid, Stack, Text, useToast } from '@chakra-ui/react';
import React, { useCallback, useState } from 'react';
import { CreateUserBodyResponse } from '../../classes/ServiceClient';
import useCoveyAppState from '../../hooks/useCoveyAppState';

interface UserCreationProps {
  doLogin: (initData: CreateUserBodyResponse) => Promise<boolean>;
}

export default function UserCreation({ doLogin }: UserCreationProps): JSX.Element {
  const [newUserName, setNewUserName] = useState<string>('');
  const { apiClient } = useCoveyAppState();
  const toast = useToast();

  const handleCreateUser = useCallback(
    async (username: string) => {
      try {
        const createUserResponse = await apiClient.createUser({ username });
        await doLogin(createUserResponse);
      } catch (err) {
        toast({
          title: `Unable to create user: ${username}`,
          description: err.toString(),
          status: 'error',
        });
      }
    },
    [doLogin, toast, apiClient],
  );

  return (
    <Center>
      <Box>
        <Container as={SimpleGrid} maxW='7xl' columns={{ base: 1, md: 1 }} spacing={{ base: 10, lg: 32 }} py={{ base: 10, sm: 20, lg: 32 }}>
          <Stack bg='gray.50' rounded='xl' p={{ base: 4, sm: 6, md: 8 }} spacing={{ base: 8 }} maxW={{ lg: 'lg' }}>
            <Stack spacing={4}>
              <Heading color='gray.800' lineHeight={1.1} fontSize={{ base: '2xl', sm: '3xl', md: '4xl' }}>
                Create your user
                <Text as='span' bgGradient='linear(to-r, red.400,pink.400)' bgClip='text'>
                  !
                </Text>
              </Heading>
              <Text color='gray.500' fontSize={{ base: 'sm', sm: 'md' }}>
                Covey.Town is a social platform that integrates a 2D game-like metaphor with video chat. To get started, setup your camera and microphone, choose a username, and then create a new town
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
                onClick={() => handleCreateUser(newUserName)}
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
