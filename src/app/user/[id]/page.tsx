import Navbar from "@/components/layout/navbar";
import ProfilePage from "@/features/profile/components/profile-page";
import { mockProfile } from "@/features/projects/services/project-mock-data";

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
