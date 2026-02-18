import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      // attach user id to session so we can use it in API routes
      session.user.id = token.sub;
      return session;
    },
  },
  pages: {
    signIn: "/",  // redirect to home, we handle login UI ourselves
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
