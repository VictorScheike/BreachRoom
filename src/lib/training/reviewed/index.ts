import { AI_ASSISTANT_QUESTIONS } from "@/lib/training/reviewed/ai-assistants";
import { AWS_QUESTIONS } from "@/lib/training/reviewed/aws";
import { AZURE_QUESTIONS } from "@/lib/training/reviewed/azure";
import { CICD_QUESTIONS } from "@/lib/training/reviewed/cicd";
import { DEVELOPERS_DEVOPS_QUESTIONS } from "@/lib/training/reviewed/developers-devops";
import { FINANCE_HR_QUESTIONS } from "@/lib/training/reviewed/finance-hr";
import { GENERAL_EMPLOYEE_QUESTIONS } from "@/lib/training/reviewed/general-employees";
import { GITHUB_QUESTIONS } from "@/lib/training/reviewed/github";
import { IT_SECURITY_QUESTIONS } from "@/lib/training/reviewed/it-security";
import { LEADERS_RISK_QUESTIONS } from "@/lib/training/reviewed/leaders-risk";
import { MICROSOFT_365_QUESTIONS } from "@/lib/training/reviewed/microsoft-365";
import type { ReviewedQuestion } from "@/lib/training/reviewed/types";

export const REVIEWED_QUESTIONS: readonly ReviewedQuestion[] = [
  ...GENERAL_EMPLOYEE_QUESTIONS,
  ...FINANCE_HR_QUESTIONS,
  ...DEVELOPERS_DEVOPS_QUESTIONS,
  ...IT_SECURITY_QUESTIONS,
  ...LEADERS_RISK_QUESTIONS,
  ...MICROSOFT_365_QUESTIONS,
  ...AZURE_QUESTIONS,
  ...AWS_QUESTIONS,
  ...GITHUB_QUESTIONS,
  ...CICD_QUESTIONS,
  ...AI_ASSISTANT_QUESTIONS,
];

export function reviewedQuestionBank(): readonly ReviewedQuestion[] {
  return REVIEWED_QUESTIONS;
}
