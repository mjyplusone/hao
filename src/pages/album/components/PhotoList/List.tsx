import { View, Text, Image, ScrollView } from '@tarojs/components'
import React, { useState, useCallback, useMemo } from 'react'
import { Photo } from '@/types'
import Taro from '@tarojs/taro'
import styles from './index.module.scss'
import { useTransferStore } from '@/store/transfer'
import { getFileType } from '@/utils/fileType'

// 网格布局配置
const COLUMNS = 3 // 每行照片数量
const GAP = 8 // 照片之间的间距（rpx）
const PADDING = 40
// 计算每张照片的尺寸（rpx）：屏幕宽度减去左右边距和间距
const photoSizeRpx = (750 - PADDING * 2 - (COLUMNS - 1) * GAP) / COLUMNS

interface Props {
    photoList: Photo[]
    selectionMode: 'select' | 'selectAll' | null
    onLoadMore?: () => void
    onPreview?: (photo: Photo) => void
}

// 将照片列表按行分组
interface PhotoRow {
    photos: Photo[]
    rowIndex: number
}

export const List: React.FC<Props> = ({
    photoList = [],
    selectionMode,
    onLoadMore,
    onPreview,
}) => {
    const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set([]))

    // 将照片列表按行分组
    const photoRows = useMemo<PhotoRow[]>(() => {
        const rows: PhotoRow[] = []
        for (let i = 0; i < photoList.length; i += COLUMNS) {
            rows.push({
                photos: photoList.slice(i, i + COLUMNS),
                rowIndex: Math.floor(i / COLUMNS)
            })
        }
        return rows
    }, [photoList])

    React.useEffect(() => {
        if (selectionMode === 'selectAll') {
            setSelectedItems(new Set(photoList.map((photo) => photo.id)))
        } else {
            setSelectedItems(new Set())
        }
    }, [selectionMode, photoList])

    const handleItemSelect = useCallback((itemId: number) => {
        setSelectedItems(prev => {
            const newSelectedItems = new Set(prev)
            if (newSelectedItems.has(itemId)) {
                newSelectedItems.delete(itemId)
            } else {
                newSelectedItems.add(itemId)
            }
            return newSelectedItems
        })
    }, [])

    const handlePhotoClick = useCallback((photo: Photo) => {
        if (selectionMode) {
            handleItemSelect(photo.id)
        } else {
            onPreview?.(photo)
        }
    }, [selectionMode, handleItemSelect, onPreview])

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

    // 处理 scroll-view 的滚动到底部事件
    const handleScrollToLower = useCallback(() => {
        onLoadMore?.()
    }, [onLoadMore])

    return (
        <>
            {/* 使用 scroll-view 替代 VirtualList，这样 lazyLoad 可以生效 */}
            <View 
                className={styles.photoListScrollView}
                style={{ height: 'calc(100vh - 200rpx)' }}
            >
                <ScrollView
                    className={styles.scrollView}
                    scrollY
                    lowerThreshold={200}
                    onScrollToLower={handleScrollToLower}
                    style={{ height: '100%' }}
                >
                    {photoRows.map((row) => (
                        <View 
                            key={`row-${row.rowIndex}`}
                            className={styles.photoRow}
                            style={{
                                paddingLeft: `${GAP}rpx`,
                                paddingRight: `${GAP}rpx`,
                                height: `${photoSizeRpx}rpx`,
                                marginTop: row.rowIndex === 0 ? '0' : `${GAP}rpx`,
                            }}
                        >
                            {row.photos.map((photo, photoIndex) => {
                                const fileType = getFileType(photo.name)
                                const isVideo = fileType === 'video'
                                const isSelected = selectedItems.has(photo.id)
                                const isUploading = photo.upload_status !== 2
                                const isTranscoding = !isUploading && isVideo && photo.transcode_status !== 3
                                
                                return (
                                    <View 
                                        key={photo.id || `photo-${row.rowIndex}-${photoIndex}`}
                                        className={`${styles.photoItem} ${selectionMode ? styles.selectionMode : ''} ${isSelected ? styles.selected : ''}`}
                                        onClick={() => handlePhotoClick(photo)}
                                        style={{
                                            width: `${photoSizeRpx}rpx`,
                                            height: `${photoSizeRpx}rpx`,
                                        }}
                                    >
                                        <View className={styles.photoWrapper}>
                                            <Image 
                                                src={photo.thumbnail_url} 
                                                className={styles.photoThumbnail}
                                                mode="aspectFill"
                                                lazyLoad
                                            />
                                            {isVideo && (
                                                <View className={styles.videoBadge}>
                                                    <Text className={styles.videoIcon}>▶</Text>
                                                </View>
                                            )}
                                            {(isUploading || isTranscoding) && (
                                                <View className={styles.statusBadgesContainer}>
                                                    {isUploading && (
                                                        <View className={styles.statusBadge}>
                                                            <Text className={styles.statusText}>上传中</Text>
                                                        </View>
                                                    )}
                                                    {isTranscoding && (
                                                        <View className={styles.statusBadge}>
                                                            <Text className={styles.statusText}>转码中</Text>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                            {selectionMode && (
                                                <View className={styles.checkbox}>
                                                    <View className={`${styles.checkboxInner} ${isSelected ? styles.checked : ''}`}>
                                                        {isSelected && (
                                                            <Text className={styles.checkmark}>✓</Text>
                                                        )}
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    </View>
                                )
                            })}
                            {/* 如果一行不满，用空 View 填充 */}
                            {Array.from({ length: COLUMNS - row.photos.length }).map((_, i) => (
                                <View key={`empty-${row.rowIndex}-${i}`} style={{ width: `${photoSizeRpx}rpx`, height: `${photoSizeRpx}rpx` }} />
                            ))}
                        </View>
                    ))}
                </ScrollView>
            </View>

            {selectionMode && selectedItems.size > 0 && (
                <View className={styles.downloadButton} onClick={handleDownload}>
                    <Text className={styles.downloadText}>下载至相册 ({selectedItems.size})</Text>
                </View>
            )}
        </>
    )
}