import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Setting from "@/models/Setting";
import bcrypt from "bcryptjs";

import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID || "",
            clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                await dbConnect();
                
                // 1. Check Database
                const user = await User.findOne({ email: credentials?.email });
                if (!user) {
                    throw new Error("Invalid email or password");
                }

                // If user registered with social, they might not have a password
                if (!user.password) {
                     throw new Error("Please sign in with your social account");
                }

                const isValid = await bcrypt.compare(credentials!.password, user.password);
                if (!isValid) {
                    throw new Error("Invalid email or password");
                }

                return {
                    id: user._id.toString(),
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    roles: user.roles,
                    isPremium: user.isPremium
                };
            }
        })
    ],
    pages: {
        signIn: "/login",
        error: "/login",
    },
    callbacks: {
        async signIn({ user, account }: any) {
            if (account?.provider === 'google' || account?.provider === 'github') {
                try {
                    await dbConnect();
                    const existingUser = await User.findOne({ email: user.email });
                    
                    if (!existingUser) {
                        // Check if registration is open
                        const regSetting = await Setting.findOne({ key: 'registration_enabled' });
                        const registrationOpen = regSetting ? Boolean(regSetting.value) : true; // Default open
                        if (!registrationOpen) {
                            return '/login?error=RegistrationClosed';
                        }
                        await User.create({
                            name: user.name,
                            email: user.email,
                            image: user.image,
                            roles: ['USER'], 
                        });
                    }
                    return true;
                } catch (error) {
                    console.error("Error creating user from social login:", error);
                    return false;
                }
            }
            return true;
        },
        async jwt({ token, user, trigger, session }: any) {
            // Initial Sign In
            if (user) {
                token.roles = user.roles;
                token.isPremium = (user as any).isPremium;
                token.id = user.id;
                token.isCourseRestricted = (user as any).isCourseRestricted;
                token.university = (user as any).university;
                token.semester = (user as any).semester;
                token.year = (user as any).year;
            }

            // Sync with DB on every check
            if (token.email) {
                 await dbConnect();
                 const dbUser = await User.findOne({ email: token.email });
                 if (dbUser) {
                     token.roles = dbUser.roles;
                     token.isPremium = dbUser.isPremium;
                     token.id = dbUser._id.toString();
                     token.isCourseRestricted = dbUser.isCourseRestricted;
                     token.university = dbUser.university;
                     token.semester = dbUser.semester;
                     token.year = dbUser.year;
                 }
            }

            return token;
        },
        async session({ session, token }: any) {
             if (session?.user) {
                const legacyRole = token.role ? [typeof token.role === 'string' ? token.role.toUpperCase() : ''] : [];
                (session.user as any).roles = token.roles || legacyRole;
                (session.user as any).isPremium = token.isPremium || false;
                (session.user as any).id = token.id;
                (session.user as any).isCourseRestricted = token.isCourseRestricted || false;
                (session.user as any).university = token.university;
                (session.user as any).semester = token.semester;
                (session.user as any).year = token.year;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
