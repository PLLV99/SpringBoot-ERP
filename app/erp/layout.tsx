import React from "react";
import Sidebar from "./Sidebar";

export default function ERPLayout({
    children
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex bg-slate-950">

            <Sidebar />
            <main className="flex-1 p-8 h-screen overflow-y-auto">
                <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 min-h-full text-white">
                    {children}
                </div>
            </main>
        </div>
    )
}