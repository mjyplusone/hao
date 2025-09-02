import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'
import { Say } from '@/types'

interface Props {
    messageList: Say[]
}

const RecentSay: React.FC<Props> = ({ messageList }) => {
    return (
        <View className={styles.messageList}>
            {messageList.map((message) => (
                <View 
                    key={message.id} 
                    className={styles.messageItem}
                >
                    <Text className={styles.messageContent}>{message.content}</Text>
                    <Text className={styles.messageDate}>{message.date}</Text>
                    <Text className={styles.messageUsername}>{message.username}</Text>
                </View>
          ))}
        </View>
   )
}

export default RecentSay