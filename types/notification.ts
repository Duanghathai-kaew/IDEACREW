import {
  ApplicantApplicationStatus,
  CreatorProjectStatus,
} from "@/types/status";

export type NotificationCategory = "my-project" | "applied";
export type NotificationStatus = CreatorProjectStatus | ApplicantApplicationStatus;

type NotificationBase = {
  id: string;
  eventType: string;
  title: string;
  message: string;
  projectTitle: string;
  projectId: string;
  date: string;
  isRead: boolean;
};

export type NotificationItem =
  | (NotificationBase & {
      category: "my-project";
      status: CreatorProjectStatus;
    })
  | (NotificationBase & {
      category: "applied";
      status: ApplicantApplicationStatus;
    });
