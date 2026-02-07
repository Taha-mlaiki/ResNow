"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function login(prevState: unknown, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  let redirectPath = null;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.message || "Invalid credentials" };
    }

    const data = await res.json();

    // Set cookie
    // Next.js 15+ cookies() is async
    const cookieStore = await cookies();
    cookieStore.set("token", data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: "/",
    });

    if (data.user?.role === "Admin") {
      redirectPath = "/admin";
    } else {
      redirectPath = "/dashboard";
    }

    console.log(
      "Login successful, role:",
      data.user?.role,
      "Redirecting to:",
      redirectPath,
    );
  } catch (error: unknown) {
    console.error("Login error:", error);
    return { error: "Failed to login. Please try again." };
  }

  if (redirectPath) {
    redirect(redirectPath);
  }
}

export async function register(prevState: unknown, formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");
  const firstName = formData.get("firstName");
  const lastName = formData.get("lastName");

  if (!email || !password || !firstName || !lastName) {
    return { error: "All fields are required" };
  }

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        role: "Participant",
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const data = await res.json();
      return { error: data.message || "Failed to register" };
    }
  } catch (error) {
    console.error("Register error:", error);
    return { error: "Failed to register. Please try again." };
  }

  redirect("/login?registered=true");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  return token;
}
