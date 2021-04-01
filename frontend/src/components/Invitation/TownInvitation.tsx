import React, {useCallback, useEffect, useState} from 'react';

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Table,
  TableCaption,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  GridItem,
} from '@chakra-ui/react';

import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';

import useCoveyAppState from '../../hooks/useCoveyAppState';
import useMaybeVideo from '../../hooks/useMaybeVideo';

const TownInvitation: React.FunctionComponent = () => {
  const {isOpen, onOpen, onClose} = useDisclosure();
  const video = useMaybeVideo();
  const {myUserID, currentTownID, apiClient} = useCoveyAppState();
  const [availableUsers, setAvailableUsers] = useState<{ username: string; userID: string }[]>([]);
  const [invitationToken, setInvitationToken] = useState<string>('');

  const updateInvitationToken = useCallback(() => {
    apiClient.getInvitationIDOfTown({townID: currentTownID}).then(res => {
      setInvitationToken(res.invitationID);
    });
  }, [currentTownID, apiClient]);
  const updateUserListings = useCallback(() => {
    apiClient.listUsers().then(res => {
      setAvailableUsers(res.users.filter(user => user.userID !== myUserID)
        .sort((a, b) => b.username.localeCompare(a.username)));
    });
  }, [myUserID, setAvailableUsers, apiClient]);
  useEffect(() => {
    updateInvitationToken();
    updateUserListings();
    const timer = setInterval(updateUserListings, 2000);
    return () => {
      clearInterval(timer);
    };
  }, [updateInvitationToken, updateUserListings]);

  const toast = useToast();
  const openSettings = useCallback(() => {
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(() => {
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  const handleSendInvite = useCallback(async (userID: string) => {
    try {
      await apiClient.inviteUserInSystem({
        invitedUserID: userID,
        coveyTownID: currentTownID,
      });
      toast({
        title: 'Invitation sent!',
        status: 'success',
      });
    } catch (err) {
      toast({
        title: 'Oops, something went wrong when senting the invitation.',
        description: err.toString(),
        status: 'error',
      });
    }
  }, [currentTownID, apiClient, toast]);

  return (
    <>
      <MenuItem data-testid='openMenuButton' onClick={openSettings}>
        <Typography variant='body1'>Invite</Typography>
      </MenuItem>
      <Modal isOpen={isOpen} onClose={closeSettings}>
        <ModalOverlay/>
        <ModalContent>
          <ModalHeader>Invite Other Users</ModalHeader>
          <ModalCloseButton/>
          <form>
            <ModalBody pb={6}>
              <FormLabel htmlFor='invitationLink'>Invite other users with this Link:</FormLabel>
              {`${process.env.REACT_APP_CLIENT_URL}/join/${invitationToken}`}
              <Grid container justify='flex-end'>
                <GridItem>
                  <Button data-testid='invitationCopyButton' colorScheme='green' mr={3}>
                    Copy
                  </Button>
                </GridItem>
              </Grid>

              <FormControl>
                <Box maxH='500px' overflowY='scroll' maxW='1000px'>
                  <FormLabel htmlFor='invitationIn'>Or invite them here if they are already here:</FormLabel>
                  <Table>
                    <TableCaption placement='bottom'>
                      {availableUsers.length > 0 ? 'Available users' : 'No available uers'}
                    </TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>userID</Th>
                        <Th>Activity</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {availableUsers.map(userInfo => (
                        <Tr key={userInfo.userID}>
                          <Td role='cell'>{userInfo.username}</Td>
                          <Td role='cell'>{userInfo.userID}</Td>
                          <Td role='cell'>
                            <Button onClick={() => handleSendInvite(userInfo.userID)}>
                              Invite
                            </Button>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              </FormControl>
            </ModalBody>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

export default TownInvitation;
