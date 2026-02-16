import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Naturally Organic",
  description: "Sign in to your Naturally Organic dashboard.",
};

export default function SignIn() {
  return <SignInForm />;
}
