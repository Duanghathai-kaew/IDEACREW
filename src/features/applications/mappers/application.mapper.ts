import type {
  ApplicantCard,
  ApplicationStatus,
  AppliedProjectCard,
  ApplyProfilePrefill,
  ProjectPositionOption,
} from "@/features/applications/dto/application.dto";

export function uniqTrimmed(values: string[]) {
  return Array.from(
    new Set(values.map((value) => value.trim()).filter(Boolean)),
  );
}

export function mapApplicationStatus(status: string | null): ApplicationStatus {
  if (status === "accepted" || status === "rejected") return status;
  return "pending";
}

export function buildApplyProfilePrefill(input: {
  skills?: string[] | null;
  bio?: string | null;
  portfolioUrls: string[];
}): ApplyProfilePrefill {
  return {
    skills: input.skills ?? [],
    portfolioUrls: uniqTrimmed(input.portfolioUrls),
    bio: input.bio ?? "",
  };
}

export function buildProjectPositionOption(input: {
  id: string;
  title: string;
  neededCount: number;
  acceptedCount: number;
  requiredSkills: string[];
  isActive: boolean;
}): ProjectPositionOption {
  return {
    ...input,
    isFull: input.acceptedCount >= input.neededCount,
  };
}

export function buildAppliedProjectCards(input: {
  applications: Array<{
    id: string;
    project_id: string;
    status: string | null;
    rejection_reason: string | null;
    created_at: string | null;
  }>;
  projectById: Map<
    string,
    {
      id: string;
      title: string;
      owner_id: string;
    }
  >;
  ownerById: Map<
    string,
    {
      id: string;
      displayname: string | null;
      name: string | null;
      username: string | null;
      email: string | null;
    }
  >;
  contactByOwnerId: Map<string, string>;
}): AppliedProjectCard[] {
  return input.applications.map((application) => {
    const project = input.projectById.get(application.project_id);
    const owner = project ? input.ownerById.get(project.owner_id) : undefined;

    return {
      id: application.id,
      projectId: application.project_id,
      projectTitle: project?.title ?? "โปรเจกต์",
      ownerName:
        owner?.displayname?.trim() ||
        owner?.name?.trim() ||
        owner?.username?.trim() ||
        "Project owner",
      ownerEmail: owner?.email ?? "",
      ownerContactLink: project
        ? (input.contactByOwnerId.get(project.owner_id) ?? "")
        : "",
      appliedAt: application.created_at ?? "",
      status: mapApplicationStatus(application.status),
      rejectionReason: application.rejection_reason ?? "",
    };
  });
}

export function buildApplicantCards(input: {
  applications: Array<{
    id: string;
    applicant_id: string;
    position_id: string | null;
    status: string | null;
    motivation_message: string | null;
    skills: string[] | null;
    portfolio_urls: string[] | null;
    additional_note: string | null;
    created_at: string | null;
    project_positions:
      | {
          title: string;
          needed_count: number | null;
          accepted_count: number | null;
          required_skills: string[] | null;
        }
      | {
          title: string;
          needed_count: number | null;
          accepted_count: number | null;
          required_skills: string[] | null;
        }[]
      | null;
  }>;
  profileById: Map<
    string,
    {
      id: string;
      displayname: string | null;
      name: string | null;
      username: string | null;
      avatar_url?: string | null;
      skills?: string[] | null;
    }
  >;
}): ApplicantCard[] {
  return input.applications.map((application) => {
    const profile = input.profileById.get(application.applicant_id);
    const positionData = application.project_positions as {
      title: string;
      needed_count: number | null;
      accepted_count: number | null;
      required_skills: string[] | null;
    } | null;

    return {
      id: application.id,
      applicantId: application.applicant_id,
      positionId: application.position_id ?? null,
      positionTitle: positionData?.title ?? null,
      positionNeededCount: positionData?.needed_count ?? null,
      positionAcceptedCount: positionData?.accepted_count ?? null,
      positionRequiredSkills: positionData?.required_skills ?? null,
      displayName:
        profile?.displayname?.trim() ||
        profile?.name?.trim() ||
        profile?.username?.trim() ||
        "Applicant",
      avatarUrl: profile?.avatar_url ?? "",
      skills: application.skills?.length
        ? application.skills
        : (profile?.skills ?? []),
      portfolioUrls: application.portfolio_urls ?? [],
      motivationMessage: application.motivation_message ?? "",
      additionalNote: application.additional_note ?? "",
      appliedAt: application.created_at ?? "",
      status: mapApplicationStatus(application.status),
    };
  });
}
