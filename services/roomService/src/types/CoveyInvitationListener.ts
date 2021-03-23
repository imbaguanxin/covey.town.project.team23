export default interface CoveyInvitationListener {
  getUserID(): string;

  onInvited(coveyTownID: string): void;

  onDisconnect(): void;
}
