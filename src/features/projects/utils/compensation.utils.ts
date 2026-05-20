import {
  COMPENSATION_TYPE_OPTIONS,
  COMPENSATION_TYPES,
  type CompensationType,
  type ProjectCompensation,
} from "@/features/projects/types/compensation.type";

const TYPE_LABEL_BY_VALUE = Object.fromEntries(
  COMPENSATION_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<CompensationType, string>;

export function isCompensationType(value: unknown): value is CompensationType {
  return (
    typeof value === "string" &&
    COMPENSATION_TYPES.includes(value as CompensationType)
  );
}

export function formatCompensationAmount(amount: number): string {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompensationPreview(
  amount: number | null,
  type: CompensationType | null,
): string | null {
  if (!type) return null;
  if (type === "none") return TYPE_LABEL_BY_VALUE.none;

  if (amount == null || Number.isNaN(amount) || amount < 0) return null;

  const suffix = TYPE_LABEL_BY_VALUE[type];
  if (type === "revenue_share") {
    return `${formatCompensationAmount(amount)}% (${suffix})`;
  }

  return `${formatCompensationAmount(amount)} ${suffix}`;
}

export function buildCompensationDetailText(input: {
  enabled: boolean;
  amount: number | null;
  type: CompensationType | null;
  note?: string | null;
}): string {
  if (!input.enabled) return "";

  const preview = formatCompensationPreview(input.amount, input.type);
  const note = (input.note ?? "").trim();
  if (!preview && !note) return "";

  return [preview, note].filter(Boolean).join("\n");
}

export function getCompensationDisplayText(input: {
  compensationEnabled?: boolean;
  compensationAmount?: number | null;
  compensationType?: CompensationType | null;
  compensationNote?: string | null;
  compensationDetail?: string | null;
}): string | null {
  const hasStructured =
    Boolean(input.compensationEnabled) &&
    (input.compensationType === "none" ||
      (input.compensationType != null &&
        input.compensationAmount != null &&
        !Number.isNaN(input.compensationAmount)));

  if (hasStructured) {
    const preview = formatCompensationPreview(
      input.compensationAmount ?? null,
      input.compensationType ?? null,
    );
    const note = (input.compensationNote ?? "").trim();
    const lines = [preview, note].filter(Boolean);
    return lines.length > 0 ? lines.join("\n") : null;
  }

  const legacy = (input.compensationDetail ?? "").trim();
  return legacy || null;
}

export function mapDbCompensation(row: {
  compensation_enabled?: boolean | null;
  compensation_amount?: number | string | null;
  compensation_type?: string | null;
  compensation_note?: string | null;
  compensation_detail?: string | null;
  benefits?: string[] | null;
}): ProjectCompensation & { displayText: string | null } {
  const enabled =
    row.compensation_enabled ??
    (row.benefits?.includes("compensation") ?? false);
  const rawAmount = row.compensation_amount;
  const amount =
    rawAmount == null || rawAmount === ""
      ? null
      : typeof rawAmount === "number"
        ? rawAmount
        : Number(rawAmount);

  const type = isCompensationType(row.compensation_type)
    ? row.compensation_type
    : null;
  const note = row.compensation_note?.trim() || null;

  const displayText = getCompensationDisplayText({
    compensationEnabled: enabled,
    compensationAmount: Number.isFinite(amount) ? amount : null,
    compensationType: type,
    compensationNote: note,
    compensationDetail: row.compensation_detail,
  });

  return {
    enabled,
    amount: Number.isFinite(amount) ? amount : null,
    type,
    note,
    displayText,
  };
}

export function parseLegacyCompensationDetail(
  detail: string,
): Partial<ProjectCompensation> {
  const text = detail.trim();
  if (!text) return { enabled: true };

  const lower = text.toLocaleLowerCase("th-TH");
  if (lower.includes("ไม่มีค่าตอบแทน") || lower.includes("ไม่มีค่าจ้าง")) {
    return { enabled: true, type: "none", amount: null, note: text };
  }

  const amountMatch = text.match(/([\d,]+(?:\.\d+)?)/);
  const amount = amountMatch
    ? Number(amountMatch[1].replace(/,/g, ""))
    : null;

  let type: CompensationType | null = null;
  if (text.includes("ชั่วโมง") || text.includes("/hr")) type = "per_hour";
  else if (text.includes("เดือน")) type = "per_month";
  else if (text.includes("%") || text.includes("แบ่ง")) type = "revenue_share";
  else if (text.includes("โปรเจกต์")) type = "per_project";
  else if (amount != null) type = "per_month";

  const structuredNote =
    type && amount != null
      ? text
          .replace(amountMatch?.[0] ?? "", "")
          .replace(TYPE_LABEL_BY_VALUE[type], "")
          .trim() || null
      : text;

  return {
    enabled: true,
    amount: Number.isFinite(amount) ? amount : null,
    type,
    note: structuredNote,
  };
}

export function resolveFormCompensation(input: {
  benefits: string[];
  compensationEnabled?: boolean;
  compensationAmount?: number | null;
  compensationType?: CompensationType | null;
  compensationNote?: string | null;
  compensationDetail?: string | null;
}): ProjectCompensation & { detailText: string } {
  const enabled =
    input.compensationEnabled ?? input.benefits.includes("compensation");

  if (!enabled) {
    return {
      enabled: false,
      amount: null,
      type: null,
      note: null,
      detailText: "",
    };
  }

  const hasStructuredType = isCompensationType(input.compensationType);
  if (!hasStructuredType) {
    const legacy = (input.compensationDetail ?? "").trim();
    if (legacy) {
      const parsed = parseLegacyCompensationDetail(legacy);
      const merged: ProjectCompensation = {
        enabled: true,
        amount: parsed.amount ?? null,
        type: parsed.type ?? null,
        note: parsed.note ?? null,
      };
      return {
        ...merged,
        detailText: buildCompensationDetailText(merged),
      };
    }
  }

  const amount =
    input.compensationType === "none"
      ? null
      : input.compensationAmount != null && !Number.isNaN(input.compensationAmount)
        ? input.compensationAmount
        : null;

  const compensation: ProjectCompensation = {
    enabled: true,
    amount,
    type: hasStructuredType ? input.compensationType! : null,
    note: (input.compensationNote ?? "").trim() || null,
  };

  return {
    ...compensation,
    detailText: buildCompensationDetailText(compensation),
  };
}
