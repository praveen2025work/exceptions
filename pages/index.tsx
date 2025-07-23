import React from "react";
import dynamic from "next/dynamic";

const Home = dynamic(() => import("../src/components/home"), {
  ssr: false,
});

export default function IndexPage() {
  return <Home />;
}