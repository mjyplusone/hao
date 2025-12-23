import { View, Text, Image } from '@tarojs/components'
import { VirtualList } from '@tarojs/components-advanced'
import React, { useState, useCallback, useRef } from 'react'
import { Photo } from '@/types'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useTransferStore } from '@/store/transfer'
import { formatDateTime } from '@/utils/format'
import { getFileType } from '@/utils/fileType'

// 虚拟列表配置
const ITEM_HEIGHT = 100 // 每个照片项的高度（rpx）
const screenWidth = Taro.getSystemInfoSync().screenWidth
const itemHeightPx = (screenWidth / 750) * ITEM_HEIGHT // 数字类型 px

interface Props {
    photoList: Photo[]
    selectionMode: 'select' | 'selectAll' | null
    onLoadMore?: () => void
}

export const List: React.FC<Props> = ({
    photoList = [],
    selectionMode,
    onLoadMore,
}) => {
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set([]))
    const scrollInfoRef = useRef({ scrollTop: 0, scrollHeight: 0, clientHeight: 0 })
    const touchStartRef = useRef<{ x: number; y: number } | null>(null)

    React.useEffect(() => {
        if (selectionMode === 'selectAll') {
            setSelectedItems(new Set(photoList.map((photo) => photo.id)))
        } else {
            setSelectedItems(new Set())
        }
    }, [selectionMode])

    const handleItemSelect = useCallback((itemId: number) => {
        const newSelectedItems = new Set(selectedItems)
        if (newSelectedItems.has(itemId)) {
            newSelectedItems.delete(itemId)
        } else {
            newSelectedItems.add(itemId)
        }
        setSelectedItems(newSelectedItems)
    }, [selectedItems])

    const handlePhotoClick = useCallback((photo: Photo) => {
        if (selectionMode) {
            handleItemSelect(photo.id)
        } else {
            Taro.navigateTo({
              url: `/pages/album/preview?id=${photo.id}&src=${encodeURIComponent(photo.preview_url || photo.thumbnail_url || '')}&date=${photo.created_at || ''}&name=${photo.name}`
            })
        }
    }, [selectionMode, handleItemSelect])

    const handleDownload = () => {
        if (selectedItems.size === 0) {
            Taro.showToast({
                title: '请先选择要下载的文件',
                icon: 'none'
            })
            return
        }
        const selectedFiles = Array.from(selectedItems).map((id) => {
            const photo = photoList.find((photo) => photo.id === id);
            return {
                id,
                size: photo?.size || 0,
                name: photo?.name,
            };
        })
        useTransferStore.getState().download(selectedFiles)
        Taro.showToast({
            title: '可至传输列表查看下载进度',
        })
        setSelectedItems(new Set())
    }

    // 处理滚动事件，更新滚动位置信息
    const handleScroll = useCallback((e: any) => {
        const detail = e.detail || e
        scrollInfoRef.current = {
            scrollTop: detail.scrollTop || detail.scrollOffset || 0,
            scrollHeight: detail.scrollHeight || photoList.length * itemHeightPx,
            clientHeight: detail.clientHeight || detail.height || 0,
        }
    }, [photoList.length, itemHeightPx])

    // 处理触摸开始事件，记录触摸位置
    const handleTouchStart = useCallback((e: any) => {
        const touch = e.touches?.[0] || e.changedTouches?.[0]
        if (touch) {
            touchStartRef.current = { x: touch.clientX || touch.x, y: touch.clientY || touch.y }
        }
    }, [])

    // 处理触摸结束事件，检测是否滚动到底部
    const handleTouchEnd = useCallback((e: any) => {
        // 如果没有触摸开始记录，说明不是正常的触摸流程，直接返回
        if (!touchStartRef.current) {
            return
        }

        // 检查是否是点击事件（位置变化很小）还是滚动事件
        const touch = e.changedTouches?.[0] || e.touches?.[0]
        if (touch) {
            const endX = touch.clientX || touch.x
            const endY = touch.clientY || touch.y
            const deltaX = Math.abs(endX - touchStartRef.current.x)
            const deltaY = Math.abs(endY - touchStartRef.current.y)
            
            // 如果移动距离小于 10px，认为是点击事件，不触发 loadMore
            if (deltaX < 10 && deltaY < 10) {
                touchStartRef.current = null
                return
            }
        }
        
        // 清除触摸开始记录
        touchStartRef.current = null

        // 只有真正的滚动事件才触发 loadMore
        const { scrollTop, scrollHeight, clientHeight } = scrollInfoRef.current
        const distanceToBottom = scrollHeight - scrollTop - clientHeight
        if (distanceToBottom < 200) {
            onLoadMore?.()
        }
    }, [onLoadMore])

    // 渲染单个列表项
    const renderItem = ({ index, data }) => {
        const item = data[index]
        const fileType = getFileType(item.name)
        const isVideo = fileType === 'video'
        
        return (
            <View 
                className={`${styles.photoItem} ${selectionMode ? styles.selectionMode : ''}`}
                onClick={() => handlePhotoClick(item)}
            >
                {selectionMode && (
                    <View className={styles.checkbox}>
                        <View className={`${styles.checkboxInner} ${selectedItems.has(item.id) ? styles.checked : ''}`}>
                            {selectedItems.has(item.id) && (
                                <Text className={styles.checkmark}>✓</Text>
                            )}
                        </View>
                    </View>
                )}
                <View className={styles.thumbnailWrapper}>
                    <Image src={item.thumbnail_url} className={styles.photoThumbnail} />
                    {isVideo && (
                        <View className={styles.videoBadge}>
                            <Text className={styles.videoIcon}>▶</Text>
                        </View>
                    )}
                </View>
                <View className={styles.photoInfo}>
                    <View className={styles.photoDateRow}>
                        <Text className={styles.photoDate}>{formatDateTime(item.created_at)}</Text>
                        {isVideo && (
                            <Text className={styles.fileTypeLabel}>视频</Text>
                        )}
                    </View>
                </View>
            </View>
        )
    }

    return (
        <>
            <VirtualList
                key={photoList.length}
                className={styles.photoListScrollView}
                height="calc(100vh - 200rpx)" // 使用剩余高度
                itemData={photoList}
                itemCount={photoList.length}
                itemSize={itemHeightPx}
                overscanCount={5} // 预渲染的额外项目数量
                item={renderItem}
                width="100%"
                onScroll={handleScroll}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            />

            {selectionMode && selectedItems.size > 0 && (
                <View className={styles.downloadButton} onClick={handleDownload}>
                    <Text className={styles.downloadText}>下载至相册 ({selectedItems.size})</Text>
                </View>
            )}
        </>
    )
}