'use server';

import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { createSession } from '@/lib/auth';
import { redirect } from 'next/navigation';

export async function signup(formData: FormData) {
  const userid = formData.get('userid') as string;
  const password = formData.get('password') as string;
  const retypePassword = formData.get('retypePassword') as string;
  const key = formData.get('key') as string;
  const role = formData.get('role') as any; // Cast as any because Prisma Enum handles mapping

  if (!userid || !password || !retypePassword || !key || !role) {
    return { error: 'All fields are required.' };
  }

  if (password !== retypePassword) {
    return { error: 'Passwords do not match.' };
  }

  const validKey = process.env.SIGNUP_KEY;
  if (!validKey) {
    return { error: 'Server configuration error: SIGNUP_KEY is not set.' };
  }

  if (key !== validKey) {
    return { error: 'Invalid signup key.' };
  }

  try {
    const existingUser = await prisma.internalUser.findUnique({
      where: { userid },
    });

    if (existingUser) {
      return { error: 'User ID already exists.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.internalUser.create({
      data: {
        userid,
        password: hashedPassword,
        role,
      },
    });

    await createSession(newUser.id, newUser.userid, newUser.role);
  } catch (error) {
    console.error('Signup error:', error);
    return { error: 'An error occurred during signup.' };
  }

  redirect('/');
}

export async function login(formData: FormData) {
  const userid = formData.get('userid') as string;
  const password = formData.get('password') as string;

  if (!userid || !password) {
    return { error: 'All fields are required.' };
  }

  try {
    const user = await prisma.internalUser.findUnique({
      where: { userid },
    });

    if (!user) {
      return { error: 'Invalid User ID or Password.' };
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return { error: 'Invalid User ID or Password.' };
    }

    await createSession(user.id, user.userid, user.role);
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login.' };
  }

  redirect('/');
}
