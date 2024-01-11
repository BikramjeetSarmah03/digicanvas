import { useEffect, useState } from "react";

import { socket } from "@/common/lib/socket";
import SocketMouse from "./SocketMouse";

export default function MouseRenderer() {
  const [mouses, setMouses] = useState<string[]>([]);

  useEffect(() => {
    socket.on("users_in_room", (socketIds: string[]) => {
      const allUsers = socketIds.filter((socketId) => socketId !== socket.id);
      setMouses(allUsers);
    });

    return () => {
      socket.off("users_in_room");
    };
  }, []);

  return (
    <>
      {mouses.map((socketId) => {
        return <SocketMouse socketId={socketId} key={socketId} />;
      })}
    </>
  );
}
