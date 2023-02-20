export interface GraphData {
  nodes: NodeObject[];
  links: LinkObject[];
}

export interface NodeObject {
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
  vx?: number;
  vy?: number;
  id?: string | number;
}

export interface LinkObject {
  source?: string | number | NodeObject;
  target?: string | number | NodeObject;
}
