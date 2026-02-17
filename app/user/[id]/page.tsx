import Navbar from "@/components/Navbar";
import ProfilePage from "@/components/ProfilePage";
import { mockProfile } from "@/lib/mockData";

export default function PublicProfile() {
  return (
    <>
      <Navbar />
      <ProfilePage initialProfile={mockProfile} />
    </>
  );
}
