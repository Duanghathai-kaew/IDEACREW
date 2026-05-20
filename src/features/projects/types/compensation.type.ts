export const COMPENSATION_TYPES = [
  "per_project",
  "per_month",
  "per_hour",
  "revenue_share",
  "none",
] as const;

export type CompensationType = (typeof COMPENSATION_TYPES)[number];

export const COMPENSATION_TYPE_OPTIONS: {
  value: CompensationType;
  label: string;
}[] = [
  { value: "per_project", label: "บาท/โปรเจกต์" },
  { value: "per_month", label: "บาท/เดือน" },
  { value: "per_hour", label: "บาท/ชั่วโมง" },
  { value: "revenue_share", label: "รายได้แบ่ง %" },
  { value: "none", label: "ไม่มีค่าตอบแทน" },
];

export type ProjectCompensation = {
  enabled: boolean;
  amount: number | null;
  type: CompensationType | null;
  note: string | null;
};

export const defaultProjectCompensation = (): ProjectCompensation => ({
  enabled: false,
  amount: null,
  type: null,
  note: null,
});
