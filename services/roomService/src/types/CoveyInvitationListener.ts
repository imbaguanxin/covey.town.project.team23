export default interface CoveyInvitationListener {
  getUserID(): string;

  onInvited(coveyTownID: string, friendlyName: string): void;

  onDisconnect(): void;
}
