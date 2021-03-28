import { Button, Container, Input, InputGroup, InputRightElement } from '@chakra-ui/react';
import React from 'react';
import { CreateUserBodyResponse } from '../../classes/ServiceClient';

interface UserCreationProps {
  doLogin: (initData: CreateUserBodyResponse) => Promise<boolean>;
}

export default function UserCreation({ doLogin }: UserCreationProps): JSX.Element {
  return (
    <>
      <Container>
        <InputGroup size='md'>
          <Input pr='4.5rem' placeholder='Enter username' />
          <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm'>
              Create
            </Button>
          </InputRightElement>
        </InputGroup>
      </Container>
    </>
  );
}
