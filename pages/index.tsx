import Head from "next/head";

import Canvas from "@/modules/room/components/Canvas";

export default function Home() {
  return (
    <>
      <Head>
        <title>Digicanvas</title>
      </Head>

      <Canvas />
    </>
  );
}
