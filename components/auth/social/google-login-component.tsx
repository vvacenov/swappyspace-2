"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle as Google } from "react-icons/fc";
import { FaDiscord as Discord } from "react-icons/fa";
import { FaGithub as Github } from "react-icons/fa";
import { createClient } from "@/utils/supabase/client";

export function GoogleLoginComponent() {
  const loginWithGoogle = () => {
    const oAuthGoole = createClient();
    oAuthGoole.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };
  return (
    <Button className="w-full flex gap-3" onClick={loginWithGoogle}>
      <Google className="text-3xl" />
      <span className="select-none">Continue with Google</span>
    </Button>
  );
}

export function DiscordLoginComponent() {
  const loginWithDiscord = () => {
    const oAuthGoole = createClient();
    oAuthGoole.auth.signInWithOAuth({
      provider: "discord",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };
  return (
    <Button className="w-full flex gap-3" onClick={loginWithDiscord}>
      <Discord className="text-3xl text-[#5865F2]" />
      <span className="select-none">Continue with Discord</span>
    </Button>
  );
}

export function GitHubLoginComponent() {
  const loginWithGithub = () => {
    const oAuthGoole = createClient();
    oAuthGoole.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  };
  return (
    <Button className="w-full flex gap-3" onClick={loginWithGithub}>
      <Github className="text-3xl" />
      <span className="select-none">Continue with Github</span>
    </Button>
  );
}
