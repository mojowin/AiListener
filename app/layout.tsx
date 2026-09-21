import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"AI Listener — Conversation notes",description:"Record conversations and turn them into transcripts, summaries, and next steps.",icons:{icon:"/favicon.svg"}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="en"><body>{children}</body></html>;}
