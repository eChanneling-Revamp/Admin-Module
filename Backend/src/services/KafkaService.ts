import { connectKafka, disconnectKafka, subscribeToTopic, TOPICS } from '../config/kafka';
import { logger } from '../config/logger';

export class KafkaService {
  private isConnected = false;

  async initialize(): Promise<void> {
    try {
      await connectKafka();
      this.isConnected = true;
      logger.info('Kafka service initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize Kafka service:', error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    try {
      await disconnectKafka();
      this.isConnected = false;
      logger.info('Kafka service shutdown successfully');
    } catch (error) {
      logger.error('Failed to shutdown Kafka service:', error);
    }
  }

  async subscribeToUserEvents(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka service not initialized');
    }

    // Subscribe to user events
    await subscribeToTopic(TOPICS.USER_CREATED, async (message) => {
      logger.info('User created event received:', message);
      // Handle user created event
    });

    await subscribeToTopic(TOPICS.USER_UPDATED, async (message) => {
      logger.info('User updated event received:', message);
      // Handle user updated event
    });

    await subscribeToTopic(TOPICS.USER_DELETED, async (message) => {
      logger.info('User deleted event received:', message);
      // Handle user deleted event
    });
  }

  async subscribeToBranchEvents(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka service not initialized');
    }

    // Subscribe to branch events
    await subscribeToTopic(TOPICS.BRANCH_CREATED, async (message) => {
      logger.info('Branch created event received:', message);
      // Handle branch created event
    });

    await subscribeToTopic(TOPICS.BRANCH_UPDATED, async (message) => {
      logger.info('Branch updated event received:', message);
      // Handle branch updated event
    });

    await subscribeToTopic(TOPICS.BRANCH_DELETED, async (message) => {
      logger.info('Branch deleted event received:', message);
      // Handle branch deleted event
    });
  }

  async subscribeToInvoiceEvents(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka service not initialized');
    }

    // Subscribe to invoice events
    await subscribeToTopic(TOPICS.INVOICE_CREATED, async (message) => {
      logger.info('Invoice created event received:', message);
      // Handle invoice created event
    });

    await subscribeToTopic(TOPICS.INVOICE_UPDATED, async (message) => {
      logger.info('Invoice updated event received:', message);
      // Handle invoice updated event
    });

    await subscribeToTopic(TOPICS.INVOICE_PAID, async (message) => {
      logger.info('Invoice paid event received:', message);
      // Handle invoice paid event
    });
  }

  async subscribeToAuditEvents(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka service not initialized');
    }

    // Subscribe to audit events
    await subscribeToTopic(TOPICS.AUDIT_LOG, async (message) => {
      logger.info('Audit log event received:', message);
      // Handle audit log event - could be used for real-time monitoring
    });
  }

  async subscribeToNotificationEvents(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka service not initialized');
    }

    // Subscribe to notification events
    await subscribeToTopic(TOPICS.NOTIFICATION, async (message) => {
      logger.info('Notification event received:', message);
      // Handle notification event - could trigger email, SMS, push notifications
    });
  }

  async subscribeToAllEvents(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Kafka service not initialized');
    }

    try {
      await Promise.all([
        this.subscribeToUserEvents(),
        this.subscribeToBranchEvents(),
        this.subscribeToInvoiceEvents(),
        this.subscribeToAuditEvents(),
        this.subscribeToNotificationEvents(),
      ]);
      logger.info('Subscribed to all Kafka events');
    } catch (error) {
      logger.error('Failed to subscribe to Kafka events:', error);
      throw error;
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

export default new KafkaService();
