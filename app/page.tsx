import Hero from "@/components/sections/Hero";
import Marquee from "@/components/sections/Marquee";
import Intro from "@/components/sections/Intro";
import FeaturedWork from "@/components/sections/FeaturedWork";
import EngineeringCredibility from "@/components/sections/EngineeringCredibility";
import RealWorld from "@/components/sections/RealWorld";
import { BrandStatement, FinalCTA } from "@/components/sections/Statement";

export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Intro />
      <FeaturedWork />
      <EngineeringCredibility />
      <RealWorld />
      <BrandStatement />
      <FinalCTA />
    </>
  );
}
