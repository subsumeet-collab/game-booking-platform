import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isHost: boolean;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    isHost: boolean;
  }
}
