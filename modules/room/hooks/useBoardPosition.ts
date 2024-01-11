import { useContext } from "react";
import { RoomContext } from "../context/room.context";

export const useBoardPosition = () => {
  const { x, y } = useContext(RoomContext);

  return { x, y };
};
