import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getServiceSupabase } from "@/lib/supabase";

type WalletJwtPayload = JwtPayload & { userId?: string };

type AppUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  linkedWallet?: string;
  rememberMe?: boolean;
  lastLogin?: Date;
  orgName?: string;
};

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember Me", type: "checkbox" },
        walletToken: { label: "Wallet Token", type: "text" }
      },
      async authorize(credentials) {
        const supabase = getServiceSupabase();
        
        let user;

        // WALLET-TOKEN LOGIN FLOW
        if (credentials?.walletToken) {
           const secret = process.env.NEXTAUTH_SECRET;
           if (!secret) throw new Error("Server auth not configured");
           try {
             const decoded = jwt.verify(credentials.walletToken, secret) as WalletJwtPayload;
             if (!decoded.userId) throw new Error("Invalid wallet payload");
             
             const { data: userData, error } = await supabase
               .from('users')
               .select('*')
               .eq('id', decoded.userId)
               .single();
               
             if (error || !userData) throw new Error("Invalid wallet payload");
             user = userData;
           } catch {
             throw new Error("Wallet authentication failed");
           }
        } 
        // STANDARD EMAIL/PASSWORD FLOW
        else {
          if (!credentials?.email || !credentials.password) {
            throw new Error("Missing credentials");
          }
          
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email.toLowerCase())
            .single();
            
          if (error || !userData) {
            throw new Error("Invalid email or password");
          }
          user = userData;
          
          if (user.locked_until && new Date(user.locked_until) > new Date()) {
            const diffMin = Math.ceil((new Date(user.locked_until).getTime() - new Date().getTime()) / 60000);
            throw new Error(`Account locked. Try again in ${diffMin} minutes.`);
          }
          
          const isMatch = user.password_hash ? await bcrypt.compare(credentials.password, user.password_hash) : false;
          
          if (!isMatch) {
            const failedAttempts = (user.failed_login_attempts || 0) + 1;
            const updateData: any = { failed_login_attempts: failedAttempts };
            
            if (failedAttempts >= 5) {
              updateData.locked_until = new Date(Date.now() + 15 * 60 * 1000).toISOString();
            }
            
            await supabase.from('users').update(updateData).eq('id', user.id);
            throw new Error("Invalid email or password");
          }
        }

        // Success: Reset metrics & timestamp
        await supabase.from('users').update({
          failed_login_attempts: 0,
          locked_until: null,
          last_login: new Date().toISOString()
        }).eq('id', user.id);

        // Fetch primary organisation if employer
        let orgName = undefined;
        if (user.role === "employer") {
          const { data: orgData } = await supabase
            .from('organisations')
            .select('name')
            .eq('owner_id', user.id)
            .limit(1)
            .single();
            
          if (orgData) {
            orgName = orgData.name;
          } else {
            const { data: memberData } = await supabase
              .from('organisation_members')
              .select('organisations(name)')
              .eq('user_id', user.id)
              .limit(1)
              .single();
              
            if (memberData && memberData.organisations) {
              orgName = Array.isArray(memberData.organisations) 
                ? memberData.organisations[0].name 
                : (memberData.organisations as any).name;
            }
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          linkedWallet: user.linked_wallet,
          rememberMe: credentials?.rememberMe === "true",
          lastLogin: user.last_login ? new Date(user.last_login) : undefined,
          orgName
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (trigger === "update" && session?.linkedWallet) {
        token.linkedWallet = session.linkedWallet;
      }
      if (user) {
        const u = user as unknown as AppUser;
        token.id = u.id;
        token.email = u.email;
        token.name = u.name;
        token.role = u.role;
        token.linkedWallet = u.linkedWallet;
        token.rememberMe = u.rememberMe;
        token.lastLogin = u.lastLogin;
        token.orgName = u.orgName;

        if (token.rememberMe) {
          token.exp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          userId: token.id as string,
          role: token.role as string,
          linkedWallet: token.linkedWallet as string | undefined,
          lastLogin: token.lastLogin as Date,
          orgName: token.orgName as string | undefined,
          rememberMe: token.rememberMe as boolean
        };
      }
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
};
