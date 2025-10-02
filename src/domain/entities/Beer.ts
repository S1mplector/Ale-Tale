export type BeerId = string;

export interface Beer {
  id: BeerId;
  name: string;
  brewery: string;
  style: string;
  abv: number;
}
