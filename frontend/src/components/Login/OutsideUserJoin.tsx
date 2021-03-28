import React, { useState } from 'react';
import { Box, Button, Checkbox, Flex, FormControl, FormLabel, Heading, Input, Stack, Table, TableCaption, Tbody, Td, Th, Thead, Tr, useToast } from '@chakra-ui/react';
import { CoveyTownInfo, TownJoinResponse } from '../../classes/ServiceClient';
interface TownSelectionProps {
    doLogin: (initData: TownJoinResponse) => Promise<boolean>;
}
export default function OutsideUserJoin({ doLogin }: TownSelectionProps): JSX.Element {
    const coveyRoomID = "dummyRoomID";
    const friendlyName = "dummyRoomName";
    const userName = "dummyUsername";
    return (
        <>
          <form>
            <Stack>
              <Box p='4' borderWidth='1px' borderRadius='lg'>
                <Heading as='h2' size='lg'>
                `Join in room ${friendlyName} with covey room ID: ${coveyRoomID}?`
                </Heading>
                <FormControl>
              <FormLabel htmlFor="name">Name</FormLabel>
                <Input autoFocus name="name" placeholder="Your name"
                     value={userName}
                     onChange={event => setUserName(event.target.value)}
                />
                </FormControl>
              </Box>
              <Box borderWidth='1px' borderRadius='lg'>
                <Flex p='4'>
                  <Box>
                    <Button data-testid='createUserAndJoinButton' onClick={handleCreateAndJoin}>
                      Create User and join
                    </Button>
                  </Box>
                </Flex>
              </Box>
            </Stack>
          </form>
        </>
      );
  }