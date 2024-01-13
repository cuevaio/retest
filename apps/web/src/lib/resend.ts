import { Resend } from "resend";

let instance: Resend | undefined = undefined;

export const getResendClient = () => {
  if (instance) return instance;

  instance = new Resend(process.env.RESEND_API_KEY);
  return instance;
};
