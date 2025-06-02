import { z } from 'zod'
import { isValidNigeriaCoordinate } from './postgis'
import { OWNERSHIP_TYPES, SPECIALTIES } from './types'

const nigeriaPhoneRegex = /^(\+234|0)[789][01]\d{8}$/

export const hospitalSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  lga: z.string().min(2, 'LGA is required'),
  phone: z
    .string()
    .regex(nigeriaPhoneRegex, 'Enter a valid Nigerian phone number'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  specialties: z
    .array(z.enum(SPECIALTIES as [string, ...string[]]))
    .min(1, 'Select at least one specialty'),
  ownership_type: z.enum(OWNERSHIP_TYPES as [string, ...string[]]),
  visiting_hours: z.string().optional(),
  description: z.string().optional(),
  latitude: z.number(),
  longitude: z.number(),
}).refine(
  (data) => isValidNigeriaCoordinate(data.latitude, data.longitude),
  { message: 'Coordinates must be within Nigeria', path: ['latitude'] },
)

export type HospitalFormData = z.infer<typeof hospitalSchema>

export const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  content: z.string().max(1000).optional(),
})
