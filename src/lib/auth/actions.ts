'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { validateSignupForm, validateEmail, validatePassword, type SignupFormErrors } from '@/lib/utils/validators';
import type { ApiResponse } from '@/types';

/* ─── Sign Up ──────────────────────────────────────────────── */
export async function signUp(formData: FormData): Promise<ApiResponse<null> & { errors?: SignupFormErrors }> {
  // Lowercase enforce — username must be all lowercase
  const username = (formData.get('username') as string ?? '').trim().toLowerCase();
  const displayName = (formData.get('displayName') as string ?? '').trim();
  const email = (formData.get('email') as string ?? '').trim();
  const password = (formData.get('password') as string ?? '');

  // Server-side validation
  const { valid, errors } = validateSignupForm({ username, displayName, email, password });
  if (!valid) {
    return { data: null, error: 'Validation failed.', errors };
  }

  const supabase = await createClient();

  // Check if username is taken
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (existingProfile) {
    return { data: null, error: 'That username is already taken. Try another.' };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: displayName },
    },
  });

  if (data?.user?.identities && data.user.identities.length === 0) {
    return { data: null, error: 'An account with this email already exists.' };
  }

  if (error) {
    if (error.message.includes('already registered') || error.message.includes('already exists')) {
      return { data: null, error: 'An account with this email already exists.' };
    }
    if (error.message.includes('username') && error.message.includes('duplicate')) {
      return { data: null, error: 'That username is already taken. Try another.' };
    }
    return { data: null, error: 'Something went wrong. Please try again.' };
  }

  return { data: null, error: null };
}

/* ─── Log In ───────────────────────────────────────────────── */
export async function logIn(formData: FormData): Promise<ApiResponse<null>> {
  const email = (formData.get('email') as string ?? '').trim();
  const password = (formData.get('password') as string ?? '');
  // Optional redirect target (e.g. after clicking "Log in to rank" on a title page)
  const next = (formData.get('next') as string | null)?.trim() || '/dashboard';
  // Safety check — only allow relative paths to prevent open-redirect
  const safeNext = next.startsWith('/') ? next : '/dashboard';

  // Server-side validation
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { data: null, error: emailValidation.error! };
  }
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { data: null, error: passwordValidation.error! };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    // Generic message — no email enumeration
    return { data: null, error: 'Invalid email or password.' };
  }

  revalidatePath('/', 'layout');
  redirect(safeNext);
}

/* ─── Google OAuth ─────────────────────────────────────────── */
export async function signInWithGoogle(): Promise<ApiResponse<{ url: string }>> {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
    },
  });

  if (error || !data.url) {
    return { data: null, error: 'Google sign-in is currently unavailable.' };
  }

  return { data: { url: data.url }, error: null };
}

/* ─── Log Out ──────────────────────────────────────────────── */
export async function logOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/');
}

/* ─── Password Management ──────────────────────────────────── */
export async function resetPassword(formData: FormData): Promise<ApiResponse<null>> {
  const email = (formData.get('email') as string ?? '').trim();
  const emailValidation = validateEmail(email);
  if (!emailValidation.valid) {
    return { data: null, error: emailValidation.error! };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback?next=/update-password`,
  });

  if (error) {
    return { data: null, error: 'Could not send reset email. Please try again.' };
  }

  return { data: null, error: null };
}

export async function updatePassword(password: string): Promise<ApiResponse<null>> {
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return { data: null, error: passwordValidation.error! };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { data: null, error: 'Failed to update password.' };
  }

  return { data: null, error: null };
}

export async function changePasswordWithVerification(formData: FormData): Promise<ApiResponse<null>> {
  const oldPassword = (formData.get('oldPassword') as string ?? '');
  const newPassword = (formData.get('newPassword') as string ?? '');

  const passwordValidation = validatePassword(newPassword);
  if (!passwordValidation.valid) {
    return { data: null, error: passwordValidation.error! };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { data: null, error: 'Not authenticated.' };
  }

  // Verify old password
  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: oldPassword
  });

  if (verifyError) {
    return { data: null, error: 'Incorrect old password.' };
  }

  // Update password
  const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });
  if (updateError) {
    return { data: null, error: 'Failed to update password. Try again.' };
  }

  return { data: null, error: null };
}
