import { z } from "zod";

export const createSlotSchema = z.object({
  start_at: z.string().datetime({ message: "La fecha de inicio debe tener formato ISO válido." }),
  end_at: z.string().datetime({ message: "La fecha de fin debe tener formato ISO válido." }),
  duration_minutes: z.number().min(60, { message: "La duración mínima es de 60 minutos." }).max(180, { message: "La duración máxima es de 180 minutos." }),
  price: z.number().min(0, { message: "El precio no puede ser negativo." }),
  session_type: z.string().min(1, { message: "El tipo de sesión es obligatorio." }),
}).refine(data => new Date(data.start_at) < new Date(data.end_at), {
  message: "La fecha de fin debe ser posterior a la fecha de inicio.",
  path: ["end_at"],
});

export const bookAppointmentSchema = z.object({
  slotId: z.string().uuid({ message: "El ID del horario es inválido." }),
  psicologaId: z.string().uuid({ message: "El ID del especialista es inválido." }),
});

const MAX_FILE_SIZE = 5_000_000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "application/pdf"];

// When receiving formData, files are complicated to typecast correctly in node,
// so typically we'll manually check type/size via File object interfaces, but Zod can handle the wrapper obj.
export const uploadPaymentProofSchema = z.object({
  amount: z.number().min(1, { message: "El monto debe ser superior a 0." }),
  // proof validation often done manually or via custom refine as checking File instance in Node/Next is tricky
  // with z.instanceof(File) since it might not be a standard File obj in server actions always natively, but we will use `any` and refine:
  proof: z.any()
    .refine((file) => file?.size && file.size <= MAX_FILE_SIZE, `El archivo pesa más de 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      "Solo se aceptan archivos JPG, PNG y PDF."
    ),
});

export const rejectPaymentSchema = z.object({
  paymentId: z.string().uuid({ message: "El ID del pago es inválido." }),
  reason: z.string().min(5, { message: "El motivo de rechazo debe tener al menos 5 caracteres." }),
});

export const requestDeletionSchema = z.object({
  confirmText: z.string().refine(val => val === "ELIMINAR MI CUENTA", {
    message: "Debes escribir exactamente 'ELIMINAR MI CUENTA' para confirmar."
  }),
});
