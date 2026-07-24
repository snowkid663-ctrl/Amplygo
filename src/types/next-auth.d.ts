import { Role, Currency } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      // Role is absent for a Google user who has authenticated but not yet
      // chosen an account type (see the onboarding flow).
      role?: Role;
      suspended: boolean;
      needsRole?: boolean;
      // Company logo / creator avatar URL, resolved from the DB per request.
      image?: string | null;
      // Company currency, or a creator's chosen display currency.
      currency?: Currency;
    };
  }
  interface User {
    id: string;
    role: Role;
    suspended: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    suspended?: boolean;
    needsRole?: boolean;
  }
}
