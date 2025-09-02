import { useTransferStore } from "@/store/transfer";
import { useEffect } from "react";

export default function TaskLayout({ children }: { children: React.ReactNode }) {
    const { resumeAllUnfinishedTasks} = useTransferStore()

    useEffect(() => {
        resumeAllUnfinishedTasks()
    }, [])

  return <>{children}</>;
}