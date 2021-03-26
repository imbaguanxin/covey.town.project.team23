import { TownJoinResponse } from '../../classes/ServiceClient';

interface LoginProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
}

export default function UserInvitation({ doLogin }: LoginProps): JSX.Element {
  // TODO: window/bar/dropdown list accepting invitations
  return <></>;
}
