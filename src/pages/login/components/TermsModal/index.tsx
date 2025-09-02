import { View, Text, Button } from '@tarojs/components'
import styles from './index.module.scss'

interface Props {
    showButtons: boolean
    onClose: () => void
    onAgreed: () => void
}

export const TermsModal: React.FC<Props> = ({ showButtons, onClose, onAgreed }) => {
  return (
    <View className={styles.modalOverlay}>
        <View className={styles.modal}>
            <View className={styles.modalHeader}>
                <Text className={styles.modalTitle}>小好妈妈说的都对</Text>
                {!showButtons && (
                    <View 
                        className={styles.closeBtn}
                        onClick={onClose}
                    >
                        <Text className={styles.closeIcon}>×</Text>
                    </View>
                )}
            </View>
            <View className={styles.modalContent}>
                <Text className={styles.termsText}>
                    欢迎使用 <Text className={styles.appName}>玩小好</Text>！本服务由好妈妈和坏爸爸联合开发，在使用我们的服务之前，请您仔细阅读以下条款：
                    {'\n\n'}
                    1. 小好妈妈说的都对
                    {'\n'}
                    2. 小好妈妈说的都对
                    {'\n'}
                    3. 小好妈妈说的都对
                    {'\n'}
                    （重要的事情要说三遍）
                    {'\n\n'}
                    同意以上条款才可使用该服务。
                </Text>
            </View>
            {showButtons && (
                <View className={styles.modalFooter}>
                    <Button 
                        className={styles.modalBtn}
                        onClick={onClose}
                    >
                        不同意
                    </Button>
                    <Button 
                        className={`${styles.modalBtn} ${styles.agreeBtn}`}
                        onClick={() => {
                            onAgreed()
                            onClose()
                        }}
                    >
                        同意
                    </Button>
                </View>
            )}
        </View>
    </View>
  )
}