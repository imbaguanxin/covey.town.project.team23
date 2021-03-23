export type Direction = 'front' | 'back' | 'left' | 'right';
export type UserLocation = {
  x: number;
  y: number;
  rotation: Direction;
  moving: boolean;
};
export type CoveyTownList = {
  friendlyName: string;
  coveyTownID: string;
  currentOccupancy: number;
  maximumOccupancy: number;
}[];
export type CoveyUser = {
  username: string;
  userID: string;
};
export type CoveyCreateUser = {
  username: string;
  userID: string;
  userToken: string;
};
export type CoveyUserList = CoveyUser[];
