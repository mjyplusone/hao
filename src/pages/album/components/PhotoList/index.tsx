import React, { useState } from 'react'
import { View, Text } from '@tarojs/components'
import { PhotoFolder, Photo, ViewMode } from '@/types'
import { usePagination } from 'ahooks'
import { getFolderPhotos } from '@/service'
import { List } from './List'
import styles from './index.module.scss'
import Taro, { useDidShow } from '@tarojs/taro'

interface Props {
    folder: PhotoFolder
    selectionMode: 'select' | 'selectAll' | null
}

export const PhotoList: React.FC<Props> = ({ 
    folder, 
    selectionMode,
}) => {
    const [viewMode, setViewMode] = useState<ViewMode>('my')
    
    const [photoList, setPhotoList] = useState<Photo[]>([])
    const [noMore, setNoMore] = useState(false)
    
    const { loading, pagination, run } = usePagination(
        async ({ current, pageSize }) => {
            Taro.showLoading({
                title: '加载中...',
              })

            const photos = await getFolderPhotos({ 
                folderId: folder.id, 
                page: current ?? 1
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
      run({ current: 1, pageSize: 20 })
    })

    React.useEffect(() => {
        const user = Taro.getStorageSync("userInfo")
        run({ current: 1, pageSize: 20, user: viewMode === "my" ? user.name : undefined })
    }, [folder, viewMode])

    
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

            {photoList.length === 0 ? (
                 <View className={styles.emptyState}>
                    <Text className={styles.emptyText}>暂无照片</Text>
                </View>
            ) : (
                <>
                    <View className={styles.photoListHeader}>
                        <Text className={styles.currentFolderTitle}>
                            {folder.name}
                        </Text>
                    </View>

                    <List
                        photoList={photoList}
                        selectionMode={selectionMode}
                        onLoadMore={loadMore}
                    />
                </>
            )}

            
        </View>
    )
}