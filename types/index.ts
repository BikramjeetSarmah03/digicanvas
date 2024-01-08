export interface CtxOptions {
  lineWidth: number;
  lineColor: string;
}

export interface ServerToClientEvents {
  socket_draw: (moves: [number, number][], options: CtxOptions) => void;
}

export interface ClientToServerEvents {
  draw: (moves: [number, number][], options: CtxOptions) => void;
}
