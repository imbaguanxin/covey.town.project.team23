import { CreateUserBodyResponse } from '../../classes/ServiceClient';

interface UserCreationProps {
  doLogin: (initData: CreateUserBodyResponse) => Promise<boolean>;
}

export default function UserCreation({ doLogin }: UserCreationProps): JSX.Element {
  // TODO
  return <></>;
}
