import { Kafka, Producer, Consumer } from 'kafkajs';
import { env } from './env';
import { logger } from './logger';

// Create Kafka instance
const kafka = new Kafka({
  clientId: env.KAFKA_CLIENT_ID,
  brokers: [env.KAFKA_BROKER],
  retry: {
    initialRetryTime: 100,
    retries: 8,
  },
});

// Create producer
export const producer: Producer = kafka.producer();

// Create consumer
export const consumer: Consumer = kafka.consumer({ groupId: env.KAFKA_GROUP_ID });

// Connect to Kafka
export const connectKafka = async (): Promise<void> => {
  try {
    await producer.connect();
    await consumer.connect();
    logger.info('Connected to Kafka successfully');
  } catch (error) {
    logger.error('Failed to connect to Kafka:', error);
    throw error;
  }
};

// Disconnect from Kafka
export const disconnectKafka = async (): Promise<void> => {
  try {
    await producer.disconnect();
    await consumer.disconnect();
    logger.info('Disconnected from Kafka successfully');
  } catch (error) {
    logger.error('Error disconnecting from Kafka:', error);
  }
};

// Send message to Kafka topic
export const sendMessage = async (topic: string, message: any): Promise<void> => {
  try {
    await producer.send({
      topic,
      messages: [
        {
          key: message.id || Date.now().toString(),
          value: JSON.stringify(message),
          timestamp: Date.now().toString(),
        },
      ],
    });
    logger.info(`Message sent to topic ${topic}:`, message);
  } catch (error) {
    logger.error(`Failed to send message to topic ${topic}:`, error);
    throw error;
  }
};

// Subscribe to Kafka topic
export const subscribeToTopic = async (
  topic: string,
  handler: (message: any) => Promise<void>
): Promise<void> => {
  try {
    await consumer.subscribe({ topic, fromBeginning: false });
    
    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const messageValue = message.value?.toString();
          if (messageValue) {
            const parsedMessage = JSON.parse(messageValue);
            await handler(parsedMessage);
            logger.info(`Processed message from topic ${topic}:`, parsedMessage);
          }
        } catch (error) {
          logger.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });
    
    logger.info(`Subscribed to topic ${topic}`);
  } catch (error) {
    logger.error(`Failed to subscribe to topic ${topic}:`, error);
    throw error;
  }
};

// Topic names
export const TOPICS = {
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  USER_DELETED: 'user.deleted',
  BRANCH_CREATED: 'branch.created',
  BRANCH_UPDATED: 'branch.updated',
  BRANCH_DELETED: 'branch.deleted',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_UPDATED: 'invoice.updated',
  INVOICE_PAID: 'invoice.paid',
  AUDIT_LOG: 'audit.log',
  NOTIFICATION: 'notification.send',
} as const;

export default kafka;
