import Navbar from "@/components/Navbar";
import ProfilePage from "@/components/ProfilePage";
import { mockProfile } from "@/lib/mockData";

type PublicProfilePageProps = {
  params: Promise<{ id: string }>;
};

export default async function PublicProfile({ params }: PublicProfilePageProps) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <ProfilePage initialProfile={mockProfile} userId={id} />
    </>
  );
}
