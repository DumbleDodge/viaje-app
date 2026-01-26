import { get, set } from 'idb-keyval';

const QUEUE_KEY = 'offline_operations_queue';

/**
 * Offline operations queue manager
 * Stores operations when offline and processes them when online
 */
export class OfflineQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
    }

    /**
     * Initialize queue from IndexedDB
     */
    async init() {
        try {
            const stored = await get(QUEUE_KEY);
            this.queue = stored || [];
            console.log(`📦 Loaded ${this.queue.length} pending operations from disk`);
        } catch (e) {
            console.error('Failed to load offline queue:', e);
            this.queue = [];
        }
    }

    /**
     * Add an operation to the queue
     * @param {Object} operation - Operation to queue
     * @param {string} operation.id - Unique ID
     * @param {string} operation.type - Operation type (e.g., 'UPDATE_ITEMS')
     * @param {Function} operation.execute - Async function to execute
     * @param {Object} operation.data - Data associated with operation
     */
    async add(operation) {
        // Create operation with metadata
        const op = {
            ...operation,
            id: operation.id || `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            retries: 0
        };

        // Don't serialize the execute function to IndexedDB
        const serializableOp = { ...op };
        delete serializableOp.execute;

        this.queue.push(op);

        // Persist to disk (without execute function)
        try {
            const queueToStore = this.queue.map(o => {
                const copy = { ...o };
                delete copy.execute;
                return copy;
            });
            await set(QUEUE_KEY, queueToStore);
            console.log(`➕ Queued operation: ${op.type} (Total: ${this.queue.length})`);
        } catch (e) {
            console.error('Failed to persist queue:', e);
        }

        return op.id;
    }

    /**
     * Process all pending operations
     * @param {Object} executors - Map of operation types to executor functions
     */
    async process(executors = {}) {
        if (this.isProcessing) {
            console.log('⏳ Queue processing already in progress');
            return;
        }

        if (this.queue.length === 0) {
            console.log('✅ Queue is empty, nothing to process');
            return;
        }

        this.isProcessing = true;
        console.log(`🔄 Processing ${this.queue.length} queued operations...`);

        const processed = [];
        const failed = [];

        for (const op of [...this.queue]) {
            try {
                // Get the executor function for this operation type
                const executor = executors[op.type] || op.execute;

                if (!executor) {
                    console.warn(`⚠️ No executor found for operation type: ${op.type}`);
                    failed.push(op);
                    continue;
                }

                // Execute the operation
                await executor(op.data);
                console.log(`✅ Executed: ${op.type}`);
                processed.push(op.id);

            } catch (error) {
                console.error(`❌ Failed to execute ${op.type}:`, error);
                op.retries = (op.retries || 0) + 1;

                // Remove after 3 failed retries
                if (op.retries >= 3) {
                    console.error(`🗑️ Removing operation after 3 failed attempts: ${op.type}`);
                    processed.push(op.id);
                } else {
                    failed.push(op);
                }
            }
        }

        // Remove processed operations
        this.queue = this.queue.filter(op => !processed.includes(op.id));

        // Persist updated queue
        try {
            const queueToStore = this.queue.map(o => {
                const copy = { ...o };
                delete copy.execute;
                return copy;
            });
            await set(QUEUE_KEY, queueToStore);
            console.log(`💾 Queue updated. Remaining: ${this.queue.length}`);
        } catch (e) {
            console.error('Failed to update queue:', e);
        }

        this.isProcessing = false;

        return {
            processed: processed.length,
            failed: failed.length,
            remaining: this.queue.length
        };
    }

    /**
     * Get count of pending operations
     */
    getCount() {
        return this.queue.length;
    }

    /**
     * Clear all pending operations
     */
    async clear() {
        this.queue = [];
        await set(QUEUE_KEY, []);
        console.log('🗑️ Queue cleared');
    }
}

// Export singleton instance
export const offlineQueue = new OfflineQueue();
