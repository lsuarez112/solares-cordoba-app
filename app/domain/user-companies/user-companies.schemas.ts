import { z } from "zod"

export const UserCompanyMemberSchema = z.object({
  user_id: z.string().uuid(),
  company_id: z.string().uuid(),
  is_default: z.boolean(),
  created_at: z.string(),
  user: z.object({
    full_name: z.string().nullable(),
    avatar_url: z.string().nullable(),
    active: z.boolean(),
    role: z.object({ id: z.string().uuid(), name: z.string() }).nullable(),
  }),
})

export const UserCompanyLinkSchema = z.object({
  user_id: z.string().uuid(),
  company_id: z.string().uuid(),
  is_default: z.boolean(),
  company: z.object({
    id: z.string().uuid(),
    name: z.string(),
    logo_url: z.string().nullable(),
    active: z.boolean(),
  }),
})

export type UserCompanyMember = z.infer<typeof UserCompanyMemberSchema>
export type UserCompanyLink = z.infer<typeof UserCompanyLinkSchema>
