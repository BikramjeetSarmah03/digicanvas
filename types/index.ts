export interface CtxOptions {
  lineWidth: number;
  lineColor: string;
}

export interface ServerToClientEvents {
  socket_draw: (moves: [number, number][], options: CtxOptions) => void;
  mouse_moved: (x: number, y: number, socketId: string) => void;
  users_in_room: (socketIds: string[]) => void;
}

export interface ClientToServerEvents {
  draw: (moves: [number, number][], options: CtxOptions) => void;
  mouse_move: (x: number, y: number) => void;
}
