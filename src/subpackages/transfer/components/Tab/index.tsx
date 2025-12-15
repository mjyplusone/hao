import { Text, View } from "@tarojs/components";
import styles from "./index.module.scss";
import { useTransferStore } from "@/store/transfer";
import { useMemo } from "react";

interface TabProps {
  activeTab: string;
  setActiveTab: (tab: 'upload' | 'download') => void;
}

export default function Tab({ activeTab, setActiveTab }: TabProps) {
    const { tasks } = useTransferStore()

    const { uploadTasks, downloadTasks } = useMemo(() => {
        const uploadTasks = tasks.filter((task) => task.type === 'upload')
        const downloadTasks = tasks.filter((task) => task.type === 'download')
        return { uploadTasks, downloadTasks }
    }, [tasks])

  return (
    <View className={styles.tabContainer}>
        <View 
            className={`${styles.tabItem} ${activeTab === 'upload' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('upload')}
        >
            <Text className={styles.tabText}>上传</Text>
            {uploadTasks.some(task => task.status === 'pending') && (
                <View className={styles.tabDot} />
            )}
        </View>
        <View 
            className={`${styles.tabItem} ${activeTab === 'download' ? styles.activeTab : ''}`}
            onClick={() => setActiveTab('download')}
        >
            <Text className={styles.tabText}>下载</Text>
            {downloadTasks.some(task => task.status === 'pending') && (
                <View className={styles.tabDot} />
            )}
        </View>
    </View>
  );
}