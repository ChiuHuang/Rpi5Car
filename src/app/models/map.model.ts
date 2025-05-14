export interface MapData {
  id: number;
  name: string;
  selected: boolean;
  points: Point[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Point {
  x: number;
  y: number;
  type: PointType;
}

export enum PointType {
  PATH = 'path',
  OBSTACLE = 'obstacle',
  MARKER = 'marker',
  START = 'start',
  END = 'end'
}