import React, { useState, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import { PhotoFolder, Photo, ViewMode } from '@/types'
import { usePagination } from 'ahooks'
import { getFolderPhotos } from '@/service'
import { List } from './List'
import styles from './index.module.scss'
import Taro, { useDidShow } from '@tarojs/taro'
import { Empty } from "@/components"
import { useTransferStore } from '@/store/transfer'

interface Props {
    folder: PhotoFolder
    selectionMode: 'select' | 'selectAll' | null
    onPreview?: (photo: Photo) => void
}

const PhotoList: React.FC<Props> = ({ 
    folder, 
    selectionMode,
    onPreview,
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('my')
    
    const [photoList, setPhotoList] = useState<Photo[]>([])
    const [noMore, setNoMore] = useState(false)
    
    // 监听上传任务状态，上传完成后刷新列表
    const { tasks } = useTransferStore()
    const lastCompletedTaskIdsRef = useRef<Set<string>>(new Set())
    
    const { loading, pagination, run } = usePagination(
        async ({ current, pageSize, user }) => {
            Taro.showLoading({
                title: '加载中...',
              })

            const photos = await getFolderPhotos({ 
                folderId: folder.id, 
                page: current ?? 1,
                user: user
            })
            
            // 如果是第一页，直接设置；否则追加
            const currentPhotoList = current === 1 ? photos : [...photoList, ...photos]
            setPhotoList(currentPhotoList)
            
            // 判断是否还有更多数据
            setNoMore(photos.length < pageSize)

            Taro.hideLoading()
   
            return {
                list: currentPhotoList,
                total: photos.length < pageSize 
                    ? currentPhotoList.length
                    : currentPhotoList.length + pageSize,
            }
        },
        {
            manual: true,
            defaultPageSize: 20,
        }
    )

    // 页面显示时刷新数据
    useDidShow(() => {
        const user = Taro.getStorageSync("userInfo")
        run({ current: 1, pageSize: 20, user: viewMode === "my" ? user.name : undefined })
    })

    React.useEffect(() => {
        const user = Taro.getStorageSync("userInfo")
        run({ current: 1, pageSize: 20, user: viewMode === "my" ? user.name : undefined })
    }, [viewMode])

    // 监听上传任务完成，自动刷新列表
    React.useEffect(() => {
        const completedUploadTasks = tasks.filter(
            task => task.type === 'upload' && task.status === 'completed'
        )
        const currentCompletedTaskIds = new Set(completedUploadTasks.map(task => task.id))
        
        // 检查是否有新的上传任务完成（不在上次记录的集合中）
        const hasNewCompletedTask = Array.from(currentCompletedTaskIds).some(
            id => !lastCompletedTaskIdsRef.current.has(id)
        )
        
        // 如果有新的上传任务完成，刷新列表
        if (hasNewCompletedTask) {
            const user = Taro.getStorageSync("userInfo")
            run({ current: 1, pageSize: 20, user: viewMode === "my" ? user.name : undefined })
            lastCompletedTaskIdsRef.current = currentCompletedTaskIds
        }
    }, [tasks, run, viewMode])

    // 加载更多的函数
    const loadMore = React.useCallback(() => {
        if (!noMore && !loading) {
            run({ current: pagination.current + 1, pageSize: 20 })
        }
    }, [noMore, loading])

    return (
        <View className={styles.photoListContainer}>
              <View className={styles.viewModeSelector}>
                <View 
                    className={`${styles.viewModeItem} ${viewMode === 'my' ? styles.active : ''}`}
                    onClick={() => setViewMode('my')}
                >
                    我上传的
                </View>
                <View 
                    className={`${styles.viewModeItem} ${viewMode === 'all' ? styles.active : ''}`}
                    onClick={() => setViewMode('all')}
                >
                    全部
                </View>
            </View>
                
            <View className={styles.photoListHeader}>
                <Text className={styles.currentFolderTitle}>
                    {folder.name}
                </Text>
            </View>

            {photoList.length === 0 ? (
                <Empty content="暂无照片" />
            ) : (
                <List
                    photoList={photoList}
                    selectionMode={selectionMode}
                    onLoadMore={loadMore}
                    onPreview={onPreview}
                />
            )}
            
        </View>
    )
}

export default PhotoList