import { CheckIcon, CloseIcon, TriangleDownIcon } from '@chakra-ui/icons';
import { Box, Button, Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay, Flex, HStack, SimpleGrid, Table, Td, Th, Thead, Tr, useColorModeValue, useDisclosure } from '@chakra-ui/react';
import React from 'react';
import { TownJoinResponse } from '../../classes/ServiceClient';

interface InvitationProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
  deleteInvitation: (coveyTownID: string) => Promise<boolean>;
}

export function TownLink({ doLogin, deleteInvitation }: InvitationProps): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();

  // const { invitations, apiClient } = useCoveyAppState();

  const invitations = ['testID1', 'testID2'];

  const renderTown = (townID: string) => (
      <Tr>
        <Td>room 1</Td>
        <Td>{townID}</Td>
        <Td>
          <SimpleGrid columns={2} spacing='40px'>
            <Button leftIcon={<CheckIcon />} colorScheme='green' size='xs'>
              accept
            </Button>
            <Button leftIcon={<CloseIcon />} colorScheme='red' size='xs'>
              deny
            </Button>
          </SimpleGrid>
        </Td>
      </Tr>
    );

  return (
    <>
      <Button rightIcon={<TriangleDownIcon />} colorScheme='blue' onClick={onOpen}>
        Town Invitations
      </Button>
      <Drawer placement='top' onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay>
          <DrawerContent>
            <DrawerHeader borderBottomWidth='1px'>Invitations</DrawerHeader>
            <DrawerBody>
              <Table>
                <Thead>
                  <Tr>
                    <Th>Room Name</Th>
                    <Th>Room ID</Th>
                    <Th>Options</Th>
                  </Tr>
                </Thead>
                {invitations.map(id => renderTown(id))}
              </Table>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
}

export default function UserInvitation({ doLogin, deleteInvitation }: InvitationProps): JSX.Element {
  /* eslint-disable no-use-before-define */
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems='center' justifyContent='space-between'>
          <HStack spacing={8} alignItems='center'>
            <Box>TODO: Covey Logo</Box>
          </HStack>
          <Flex alignItems='center'>
            <TownLink doLogin={doLogin} deleteInvitation={deleteInvitation} />
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
