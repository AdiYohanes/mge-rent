import About from "@/components/About";
import Console from "@/components/Console";
import Games from "@/components/Games";
import Homepage from "@/components/Homepage";
import Pricelist from "@/components/Pricelist";
import Review from "@/components/Review";
import Rooms from "@/components/Rooms";

export default function Home() {
  return (
    <div>
      <Homepage />
      <About />
      <Console />
      <Games />
      <Rooms />
      <Pricelist />
      <Review />
    </div>
  );
}
