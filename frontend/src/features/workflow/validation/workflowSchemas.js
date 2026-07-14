import { z } from "zod";

export const rejectWorkflowSchema = z.object({
  reason_code: z.string().min(1, "Rejection reason code is required"),
  reason_note: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.reason_code === "Other" && (!data.reason_note || !data.reason_note.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Detailed reason notes are required when 'Other' is selected.",
      path: ["reason_note"],
    });
  }
});

export const holdWorkflowSchema = z.object({
  reason_code: z.string().min(1, "Hold reason code is required"),
  reason_note: z.string().optional(),
  comments: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.reason_code === "Other" && (!data.reason_note || !data.reason_note.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Detailed reason notes are required when 'Other' is selected.",
      path: ["reason_note"],
    });
  }
});
