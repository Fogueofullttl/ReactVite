import { z } from 'zod';

export const tournamentRestrictionsSchema = z.object({
  minAge: z.number().int().positive().optional(),
  maxAge: z.number().int().positive().optional(),
  gender: z.enum(['male', 'female', 'any']).optional(),
  minRating: z.number().int().nonnegative().optional(),
  maxRating: z.number().int().positive().optional(),
});

export const tournamentConfigSchema = z.object({
  maxParticipants: z.number().int().positive().nullable(),
  registrationDeadline: z.date(),
  participationFee: z.number().nonnegative(),
  requiresActiveMembership: z.boolean(),
  drawType: z.enum(['automatic', 'manual']),
  groupStage: z.object({
    enabled: z.boolean(),
    playersPerGroup: z.union([z.literal(3), z.literal(4), z.literal(5)]),
    advancePerGroup: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  }),
  eliminationStage: z.object({
    enabled: z.boolean(),
    format: z.literal('single_elimination'),
  }),
  restrictions: tournamentRestrictionsSchema.optional(),
});

export const tournamentRegistrationSchema = z.object({
  userId: z.union([z.string(), z.array(z.string())]),
  registeredAt: z.date(),
  paymentStatus: z.enum(['unpaid', 'paid']),
  paymentCode: z.string().optional(),
  status: z.enum(['pending', 'confirmed']),
});

export const createTournamentSchema = z.object({
  name: z.string().min(1, 'Nombre del torneo es requerido'),
  venue: z.string().min(1, 'Sede es requerida'),
  date: z.date(),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Formato de hora inválido (HH:MM)'),
  status: z.enum(['draft', 'registration_open', 'registration_closed', 'in_progress', 'completed']),
  type: z.enum(['singles_male', 'singles_female', 'doubles_male', 'doubles_female', 'doubles_mixed']),
  category: z.string(),
  config: tournamentConfigSchema,
  registrations: z.array(tournamentRegistrationSchema),
  draw: z.object({
    groups: z.array(z.object({
      groupId: z.string(),
      participants: z.array(z.string()),
      matchIds: z.array(z.string()),
    })),
    eliminationBracket: z.object({
      round: z.string(),
      matchIds: z.array(z.string()),
    }),
  }).nullable(),
  director: z.string().nullable(),
  createdBy: z.string(),
}).refine(
  (data) => data.config.registrationDeadline < data.date,
  {
    message: 'Fecha límite de inscripción debe ser antes de la fecha del torneo',
    path: ['config', 'registrationDeadline'],
  }
);

export type CreateTournamentInput = z.infer<typeof createTournamentSchema>;
