import { z } from "zod";

export const CreateBookingSchema = z.object({
  entity_id: z.string().min(1, {
    message: "Пожалуйста, выберите рабочее место или помещение",
  }),
  date: z.date({
    required_error: "Пожалуйста, выберите дату",
  }),
  time_from: z.string().min(1, {
    message: "Пожалуйста, выберите время начала",
  }),
  time_to: z.string().min(1, {
    message: "Пожалуйста, выберите время окончания",
  }),
  user_id: z.string().min(1, {
    message: "Пожалуйста, выберите пользователя",
  }),
});
