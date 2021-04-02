import { CheckIcon, CloseIcon, TriangleDownIcon } from '@chakra-ui/icons';
import {
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  HStack,
  Image,
  SimpleGrid,
  Table,
  Td,
  Th,
  Thead,
  Tr,
  useColorModeValue,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import assert from 'assert';
import React, { useCallback } from 'react';
import { TownJoinResponse } from '../../classes/ServiceClient';
import Video from '../../classes/Video/Video';
import useCoveyAppState from '../../hooks/useCoveyAppState';
import GoToTownListButton from '../Login/GoToTownListButton';
import LogoutButton from '../Login/LogoutButton';
import useVideoContext from '../VideoCall/VideoFrontend/hooks/useVideoContext/useVideoContext';

interface TownLinkProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
  deleteInvitation: (coveyTownID: string) => Promise<boolean>;
}

function TownLink({ doLogin, deleteInvitation }: TownLinkProps): JSX.Element {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { connect } = useVideoContext();

  const { invitations, userName, currentTownID } = useCoveyAppState();

  const toast = useToast();

  const handleDelete = useCallback(
    async (coveyRoomID: string) => {
      try {
        await deleteInvitation(coveyRoomID);
      } catch (err) {
        toast({
          title: 'Unable to join town',
          description: 'Please enter a town ID',
          status: 'error',
        });
      }
    },
    [deleteInvitation, toast],
  );

  const handleAccept = useCallback(
    async (coveyRoomID: string) => {
      try {
        if (coveyRoomID === currentTownID) {
          toast({
            title: `You are already in the town you are trying to join!`,
            status: 'info',
          });
        } else {
          const initData = await Video.setup(userName, coveyRoomID);
          const loggedIn = await doLogin(initData);
          if (loggedIn) {
            assert(initData.providerVideoToken);
            await connect(initData.providerVideoToken);
          }
        }
        onClose();
      } catch (err) {
        toast({
          title: 'Unable to connect to Towns Service',
          description: err.toString(),
          status: 'error',
        });
      }
    },
    [toast, connect, doLogin, userName, currentTownID, onClose],
  );

  const renderTown = (townID: string, friendlyName: string) => (
    <Tr>
      <Td>{friendlyName}</Td>
      <Td>{townID}</Td>
      <Td>
        <SimpleGrid columns={2} spacing='40px'>
          <Button leftIcon={<CheckIcon />} colorScheme='green' size='xs' onClick={() => handleAccept(townID)}>
            Join Town
          </Button>
          <Button leftIcon={<CloseIcon />} colorScheme='red' size='xs' onClick={() => handleDelete(townID)}>
            Delete Invitation
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
                {invitations.map(town => renderTown(town.coveyTownID, town.friendlyName))}
              </Table>
            </DrawerBody>
          </DrawerContent>
        </DrawerOverlay>
      </Drawer>
    </>
  );
}

interface InvitationProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
  doLogout: () => Promise<boolean>;
  deleteInvitation: (coveyTownID: string) => Promise<boolean>;
}

export default function UserInvitation({ doLogin, doLogout, deleteInvitation }: InvitationProps): JSX.Element {
  /* eslint-disable no-use-before-define */
  return (
    <>
      <Box bg={useColorModeValue('gray.100', 'gray.900')} px={4}>
        <Flex h={16} alignItems='center' justifyContent='space-between'>
          <HStack spacing={8} alignItems='center'>
            <GoToTownListButton />
          </HStack>
          <Flex alignItems='center'>
            <LogoutButton doLogout={doLogout} />
            <TownLink doLogin={doLogin} deleteInvitation={deleteInvitation} />
          </Flex>
        </Flex>
      </Box>
    </>
  );
}
