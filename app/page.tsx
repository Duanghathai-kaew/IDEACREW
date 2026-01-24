import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import SearchBar from "./components/SearchBar";

export default function Home() {
  return (
    <>
      <Navbar />
      <Hero />
      <SearchBar />
    </>
  );
}
