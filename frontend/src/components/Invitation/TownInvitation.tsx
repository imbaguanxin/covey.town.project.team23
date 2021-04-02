import React, { useCallback } from 'react';

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

import useMaybeVideo from '../../hooks/useMaybeVideo';

const TownInvitation: React.FunctionComponent = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const video = useMaybeVideo();

  // TODO
  const invitationToken = 'EfaZL7eicRHPv2MxClxWkART';

  const toast = useToast();
  const openSettings = useCallback(() => {
    onOpen();
    video?.pauseGame();
  }, [onOpen, video]);

  const closeSettings = useCallback(() => {
    onClose();
    video?.unPauseGame();
  }, [onClose, video]);

  const handleSendInvite = async (userID: string) => {
    toast({
      title: 'debug, remove this when you implement this functionality',
      description: `current status: userID: ${userID}`,
      status: 'info',
    });
  };

  return (
    <>
      <MenuItem data-testid='openMenuButton' onClick={openSettings}>
        <Typography variant='body1'>Invite</Typography>
      </MenuItem>
      <Modal isOpen={isOpen} onClose={closeSettings}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Invite Other Users</ModalHeader>
          <ModalCloseButton />
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
                <Box maxH='700px' overflowY='scroll'>
                  <FormLabel htmlFor='invitationIn'>Or invite them here if they are already here:</FormLabel>
                  <Table>
                    <TableCaption placement='bottom'>Available users</TableCaption>
                    <Thead>
                      <Tr>
                        <Th>Name</Th>
                        <Th>userID</Th>
                        <Th>Activity</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      <Tr key='demoUserID'>
                        <Td role='cell'>DEMO_NAME</Td>
                        <Td role='cell'>demoUserID</Td>
                        <Td role='cell'>
                          <Button
                            onClick={() => {
                              handleSendInvite('demoUserID');
                            }}>
                            Invite
                          </Button>
                        </Td>
                      </Tr>
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
