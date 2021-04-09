export default interface CoveyInvitationListener {

  /** This method identifies the owner of the socket */
  getUserID(): string;

  /**
   * Called when a user is invited to a town
   * @param coveyTownID 
   * @param friendlyName 
   */
  onInvited(coveyTownID: string, friendlyName: string): void;

  /**
   * Called when the user disconnects (close the tab or logout)
   */
  onDisconnect(): void;
}
