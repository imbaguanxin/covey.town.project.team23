import { TownJoinResponse } from '../../classes/TownsServiceClient';

interface UserCreationProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
}

export default function UserCreation({ doLogin }: UserCreationProps): JSX.Element {
  // TODO
  return <></>;
}
