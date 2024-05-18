import "./globals.css";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });

import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/page";
import { redirect } from 'next/navigation';
import Providers from "./components/Provider";
import Header from "./components/Header";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if(!session) {
    redirect("/api/auth/signin");
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="w-full h-full">
          <Providers>
            <Header></Header>
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
