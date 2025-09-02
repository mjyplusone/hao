import { Button, Text, View } from "@tarojs/components";
import { VirtualList } from '@tarojs/components-advanced'
import { Task } from "@/types";
import { formatFileSize } from "@/utils/upload";
import { useTransferStore } from "@/store/transfer";
import { useCallback, useMemo, useState } from "react";
import Taro from "@tarojs/taro";
import styles from "./index.module.scss";

interface Props {
    activeTab: 'upload' | 'download'
}

// 虚拟列表配置
const ITEM_HEIGHT = 280 // 增加高度以容纳操作按钮
const screenWidth = Taro.getSystemInfoSync().screenWidth
const itemHeightPx = (screenWidth / 750) * ITEM_HEIGHT // 转换为px

const getStatusText = (status: Task["status"]) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'failed':
        return '失败'
      case 'pending':
        return '进行中'
      case 'paused':
        return '已暂停'
      default:
        return '未知'
    }
}

const getStatusClass = (status: Task["status"]) => {
    switch (status) {
      case 'completed':
        return styles.completed
      case 'failed':
        return styles.failed
      case 'pending':
        return styles.pending
      case 'paused':
        return styles.paused
      default:
        return ''
    }
}

export default function TransferList({ activeTab }: Props) {
    const { tasks, pauseTask, resumeTask, removeTask, clearTempFiles } = useTransferStore()

    const [collapsedStates, setCollapsedStates] = useState<Record<string, boolean>>({ "completed": true })

    const currentTasks = useMemo(() => {
        const uploadTasks = tasks.filter((task) => task.type === 'upload')
        const downloadTasks = tasks.filter((task) => task.type === 'download')
        return activeTab === 'upload' ? uploadTasks : downloadTasks
    }, [activeTab, tasks])

    // 按状态分组任务
    const taskGroups = useMemo(() => {
        const groups: Record<Task["status"], Task[]> = {
            pending: [],
            paused: [],
            failed: [],
            completed: [],
          }
          
          currentTasks.forEach(task => {
            if (groups[task.status]) {
              groups[task.status].push(task)
            }
          })
          
          return groups
    }, [currentTasks])

    const toggleCollapse = useCallback((status: Task["status"]) => {
        setCollapsedStates(prev => ({
          ...prev,
          [status]: !prev[status]
        }))
    }, [])

    // 处理任务操作
    const handleTaskAction = useCallback((task: Task, action: 'pause' | 'resume' | 'remove') => {
        switch (action) {
        case 'pause':
            pauseTask(task.id);
            Taro.showToast({ title: '任务已暂停', icon: 'success' });
            break;
        case 'resume':
            resumeTask(task.id);
            Taro.showToast({ title: '任务已恢复', icon: 'success' });
            break;
        case 'remove':
            Taro.showModal({
            title: '确认删除',
            content: '确定要删除这个任务吗？',
            success: (res) => {
                if (res.confirm) {
                removeTask(task.id);
                Taro.showToast({ title: '任务已删除', icon: 'success' });
                }
            }
            });
            break;
        }
    }, [pauseTask, resumeTask, removeTask])

    // 渲染单个任务项
    const renderTaskItem = ({ id, index, data }: { id: string; index: number; data: Task[] }) => {
        const item = data[index]
        return (
        <View key={item.id} className={styles.transferItem}>
            <View className={styles.fileInfo}>
            <Text className={styles.fileName}>{item.name}</Text>
            <Text className={styles.fileSize}>{formatFileSize(item.size)}</Text>
            <Text className={styles.fileDate}>{item.date}</Text>
            </View>
            
            <View className={styles.statusInfo}>
            {(item.status === 'pending' || item.status === 'paused') && (
                <View className={styles.progressContainer}>
                <View className={styles.progressBar}>
                    <View 
                    className={styles.progressFill} 
                    style={{ width: `${item.progress}%` }}
                    />
                </View>
                <Text className={styles.progressText}>{item.progress}%</Text>
                </View>
            )}
            
            {/* 任务操作按钮 */}
            <View className={styles.taskActions}>
                {item.status === 'pending' && (
                <Button   
                    className={`${styles.actionBtn} ${styles.pauseBtn}`}
                    onClick={() => handleTaskAction(item, 'pause')}
                >
                    暂停
                </Button>
                )}
                
                {item.status === 'paused' && (
                <Button 
                    className={`${styles.actionBtn} ${styles.resumeBtn}`}
                    onClick={() => handleTaskAction(item, 'resume')}
                >
                    继续
                </Button>
                )}
                
                {(item.status === 'completed' || item.status === 'failed') && (
                <Button 
                    className={`${styles.actionBtn} ${styles.removeBtn}`}
                    onClick={() => handleTaskAction(item, 'remove')}
                >
                    删除
                </Button>
                )}
            </View>
            </View>
        </View>
        )
    }

    return (
        <>
            <View className={styles.transferList}>
                {Object.entries(taskGroups).map(([status, tasks]) => {
                    if (tasks.length === 0) return null
                    
                    const isCollapsed = collapsedStates[status]
                
                    return (
                        <View key={status} className={styles.statusGroup}>
                            <View 
                                className={styles.statusHeader}
                                onClick={() => toggleCollapse(status as Task["status"])}
                            >
                            <View className={styles.statusTitle}>
                                <Text className={`${styles.status} ${getStatusClass(status as Task["status"])}`}>
                                    {getStatusText(status as Task["status"])}
                                </Text>
                                <Text className={styles.taskCount}>({tasks.length})</Text>
                            </View>
                            <View className={`${styles.collapseIcon} ${isCollapsed ? styles.collapsed : ''}`}>
                                ▼
                            </View>
                            </View>
                            
                            {!isCollapsed && (
                                <View className={styles.taskList}>
                                    <VirtualList
                                        key={tasks.length}
                                        height={tasks.length * itemHeightPx}
                                        itemData={tasks}
                                        itemCount={tasks.length}
                                        itemSize={itemHeightPx}
                                        overscanCount={3}
                                        item={renderTaskItem}
                                        width="100%"
                                    />
                                </View>
                            )}
                        </View>
                    )
                })}
            </View>

            {currentTasks.length === 0 && (
                <View className={styles.emptyState}>
                    <Text className={styles.emptyText}>
                        {activeTab === 'upload' ? '暂无上传任务' : '暂无下载任务'}
                    </Text>
                </View>
            )}
        </>
    );
}