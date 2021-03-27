import React from 'react';
import { TownJoinResponse } from '../../classes/ServiceClient';

interface UserLinkJoinProps {
  doLogin: (initData: TownJoinResponse) => Promise<boolean>;
}

export default function UserLinkJoin({ doLogin }: UserLinkJoinProps): JSX.Element {
  // TODO: window/bar/dropdown list accepting invitations
  return <>This is a test message at UserLinkJoin</>;
}