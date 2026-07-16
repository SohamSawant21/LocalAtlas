import { z } from 'zod';
import { District, LocationCategory, CrowdLevel, Difficulty, RoadCondition, Season } from '@prisma/client';

export const userAuthSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const locationFormSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters').max(100),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  district: z.nativeEnum(District),
  category: z.nativeEnum(LocationCategory),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  difficulty: z.nativeEnum(Difficulty),
  crowdLevel: z.nativeEnum(CrowdLevel),
  roadCondition: z.nativeEnum(RoadCondition),
  bestSeason: z.nativeEnum(Season),
  entryFee: z.string().optional(),
  parking: z.string().optional(),
  network: z.string().optional(),
  accessibility: z.string().optional(),
  sunset: z.string().optional(),
  tags: z.array(z.string()).default([]),
});

export const reviewSchema = z.object({
  content: z.string().min(10, 'Review must be at least 10 characters'),
  rating: z.number().min(1).max(5),
  locationId: z.string(),
});
