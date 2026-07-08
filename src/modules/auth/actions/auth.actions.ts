"use server";

import { authService } from "../services/auth.service";
import { LoginFormValues } from "../types";

export async function signInAction(values: LoginFormValues) {
  try {
    await authService.signIn(values);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
