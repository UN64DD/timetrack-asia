import { z } from 'zod';

export const RegistrationSchema = z.object({
  event_id: z.string().uuid(),
  billing: z.object({
    first_name: z.string().min(2),
    phone: z.string().min(5),
    email: z.string().email(),
    country: z.string(),
    town_city: z.string(),
    postcode: z.string(),
  }),
  participants: z.array(z.object({
    variant_id: z.string().uuid(),
    full_name: z.string().min(2),
    bib_name: z.string().optional(),
    email: z.string().email(),
    phone: z.string().min(5),
    gender: z.enum(['MALE', 'FEMALE']),
    ic_passport: z.string().min(5),
    dob: z.string().optional().nullable(),
    age: z.string().or(z.number()).optional().nullable().transform(v => v ? parseInt(v.toString()) : null),
    address: z.string(),
    postcode: z.string(),
    country: z.string(),
    medical_status: z.string(),
    medical_details: z.string().optional(),
    emergency_name: z.string(),
    emergency_phone: z.string()
  })).min(1)
});
