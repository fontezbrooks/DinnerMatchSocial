#!/usr/bin/env node

const io = require('socket.io-client');
const { performance } = require('perf_hooks');

/**
 * Stress test utility for DinnerMatch WebSocket server
 * Simulates high-load scenarios to test server stability
 */
class StressTestSuite {
    constructor(serverUrl = 'http://localhost:3001') {
        this.serverUrl = serverUrl;
        this.activeConnections = [];
        this.metrics = {
            connectionsCreated: 0,
            connectionsFailed: 0,
            messagesAent: 0,
            messagesReceived: 0,
            errors: [],
            startTime: null,
            endTime: null
        };
    }

    log(message, level = 'info') {
        const timestamp = new Date().toLocaleTimeString();
        const emoji = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            stress: '💪'
        }[level] || 'ℹ️';

        console.log(`${emoji} [${timestamp}] ${message}`);
    }

    async createConnection(userId) {
        return new Promise((resolve, reject) => {
            const socket = io(this.serverUrl, {
                transports: ['websocket'],
                timeout: 10000,
                forceNew: true
            });

            const timeout = setTimeout(() => {
                socket.disconnect();
                this.metrics.connectionsFailed++;
                reject(new Error('Connection timeout'));
            }, 10000);

            socket.on('connect', () => {
                clearTimeout(timeout);
                this.metrics.connectionsCreated++;
                resolve(socket);
            });

            socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                this.metrics.connectionsFailed++;
                this.metrics.errors.push(`Connection error: ${error.message}`);
                reject(error);
            });

            socket.on('error', (error) => {
                this.metrics.errors.push(`Socket error: ${error.message}`);
            });
        });
    }

    async rapidConnectionTest(targetConnections = 100, intervalMs = 50) {
        this.log(`🚀 Starting rapid connection test: ${targetConnections} connections`, 'stress');
        this.metrics.startTime = performance.now();

        const promises = [];

        for (let i = 0; i < targetConnections; i++) {
            const promise = new Promise((resolve) => {
                setTimeout(async () => {
                    try {
                        const socket = await this.createConnection(`stress_user_${i}`);
                        this.activeConnections.push(socket);
                        resolve(true);
                    } catch (error) {
                        resolve(false);
                    }
                }, i * intervalMs);
            });

            promises.push(promise);
        }

        const results = await Promise.all(promises);
        const successfulConnections = results.filter(r => r === true).length;

        this.log(`Connections created: ${successfulConnections}/${targetConnections}`, 'info');
        return successfulConnections;
    }

    async messageFloodTest(messagesPerSecond = 100, durationSeconds = 30) {
        this.log(`💥 Starting message flood test: ${messagesPerSecond} msg/s for ${durationSeconds}s`, 'stress');

        if (this.activeConnections.length < 2) {
            throw new Error('Need at least 2 connections for message flood test');
        }

        // Create rooms for connections
        const rooms = [];
        for (let i = 0; i < Math.floor(this.activeConnections.length / 2); i++) {
            const socket1 = this.activeConnections[i * 2];
            const socket2 = this.activeConnections[i * 2 + 1];

            try {
                const roomId = await this.createRoom(socket1, `flood_user_${i}_1`);
                await this.joinRoom(socket2, roomId, `flood_user_${i}_2`);
                rooms.push({ roomId, sender: socket1, receiver: socket2 });
            } catch (error) {
                this.log(`Failed to create room ${i}: ${error.message}`, 'warning');
            }
        }

        this.log(`Created ${rooms.length} rooms for flooding`, 'info');

        // Setup message receivers
        let messagesReceived = 0;
        rooms.forEach(room => {
            room.receiver.on('partnerSwipe', () => {
                messagesReceived++;
                this.metrics.messagesReceived++;
            });
        });

        // Start message flood
        const intervalMs = 1000 / messagesPerSecond;
        let messageCount = 0;
        const totalMessages = messagesPerSecond * durationSeconds;

        return new Promise((resolve) => {
            const sendInterval = setInterval(() => {
                if (messageCount >= totalMessages) {
                    clearInterval(sendInterval);

                    // Wait a bit for final messages
                    setTimeout(() => {
                        const deliveryRate = totalMessages > 0 ?
                            ((messagesReceived / totalMessages) * 100).toFixed(2) : 0;

                        this.log(`Message flood completed: ${messagesReceived}/${totalMessages} delivered (${deliveryRate}%)`, 'success');
                        resolve({
                            sent: totalMessages,
                            received: messagesReceived,
                            deliveryRate: parseFloat(deliveryRate)
                        });
                    }, 2000);
                    return;
                }

                // Send message from random room
                if (rooms.length > 0) {
                    const room = rooms[messageCount % rooms.length];
                    if (room.sender.connected) {
                        room.sender.emit('swipe', {
                            roomId: room.roomId,
                            direction: ['left', 'right', 'up'][messageCount % 3],
                            timestamp: Date.now(),
                            restaurantId: `flood_${messageCount}`
                        });

                        this.metrics.messagesAent++;
                        messageCount++;
                    }
                }
            }, intervalMs);
        });
    }

    async connectionDropTest(dropPercentage = 50) {
        this.log(`📉 Starting connection drop test: dropping ${dropPercentage}% of connections`, 'stress');

        const initialConnections = this.activeConnections.length;
        const connectionsToDrop = Math.floor(initialConnections * (dropPercentage / 100));

        // Randomly disconnect connections
        const connectionsToDisconnect = this.shuffleArray([...this.activeConnections])
            .slice(0, connectionsToDrop);

        connectionsToDisconnect.forEach(socket => {
            socket.disconnect();
        });

        // Remove disconnected connections from active list
        this.activeConnections = this.activeConnections.filter(socket => socket.connected);

        this.log(`Dropped ${connectionsToDrop} connections, ${this.activeConnections.length} remaining`, 'info');

        // Wait for server to process disconnections
        await new Promise(resolve => setTimeout(resolve, 2000));

        return {
            initialConnections,
            connectionsDropped: connectionsToDrop,
            remainingConnections: this.activeConnections.length
        };
    }

    async reconnectionStormTest(reconnectionCount = 50, intervalMs = 100) {
        this.log(`🌪️ Starting reconnection storm: ${reconnectionCount} reconnections`, 'stress');

        const reconnectionTimes = [];

        for (let i = 0; i < reconnectionCount; i++) {
            try {
                const startTime = performance.now();

                // Create and immediately disconnect
                const socket = await this.createConnection(`reconnect_storm_${i}`);
                socket.disconnect();

                // Reconnect
                const newSocket = await this.createConnection(`reconnect_storm_${i}_retry`);
                const reconnectTime = performance.now() - startTime;

                reconnectionTimes.push(reconnectTime);
                this.activeConnections.push(newSocket);

                await new Promise(resolve => setTimeout(resolve, intervalMs));
            } catch (error) {
                this.log(`Reconnection ${i} failed: ${error.message}`, 'warning');
            }
        }

        const avgReconnectTime = reconnectionTimes.length > 0 ?
            reconnectionTimes.reduce((a, b) => a + b, 0) / reconnectionTimes.length : 0;

        this.log(`Average reconnection time: ${avgReconnectTime.toFixed(2)}ms`, 'info');

        return {
            successfulReconnections: reconnectionTimes.length,
            averageReconnectionTime: avgReconnectTime,
            reconnectionTimes: reconnectionTimes.slice(0, 10) // Sample
        };
    }

    async createRoom(socket, userId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Create room timeout')), 10000);

            socket.emit('createRoom', { userId }, (response) => {
                clearTimeout(timeout);
                if (response.success) {
                    resolve(response.roomId);
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    async joinRoom(socket, roomId, userId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Join room timeout')), 10000);

            socket.emit('joinRoom', { roomId, userId }, (response) => {
                clearTimeout(timeout);
                if (response.success) {
                    resolve(response);
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async memoryLeakTest(cycles = 10, connectionsPerCycle = 20) {
        this.log(`🧠 Starting memory leak test: ${cycles} cycles, ${connectionsPerCycle} connections/cycle`, 'stress');

        const memorySnapshots = [];

        for (let cycle = 0; cycle < cycles; cycle++) {
            // Take memory snapshot before
            const memBefore = process.memoryUsage();

            // Create connections
            const connections = [];
            for (let i = 0; i < connectionsPerCycle; i++) {
                try {
                    const socket = await this.createConnection(`leak_test_${cycle}_${i}`);
                    connections.push(socket);

                    // Generate some activity
                    if (i % 2 === 0 && i < connectionsPerCycle - 1) {
                        const roomId = await this.createRoom(socket, `leak_test_${cycle}_${i}`);
                        await this.joinRoom(connections[i + 1] || socket, roomId, `leak_test_${cycle}_${i + 1}`);
                    }
                } catch (error) {
                    // Continue on connection errors
                }
            }

            // Generate some message activity
            connections.forEach((socket, index) => {
                if (socket.connected && index < connections.length - 1) {
                    socket.emit('swipe', {
                        roomId: `test_room_${cycle}`,
                        direction: 'right',
                        timestamp: Date.now(),
                        restaurantId: `leak_test_${cycle}_${index}`
                    });
                }
            });

            await new Promise(resolve => setTimeout(resolve, 500));

            // Disconnect all connections
            connections.forEach(socket => socket.disconnect());

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            await new Promise(resolve => setTimeout(resolve, 500));

            // Take memory snapshot after
            const memAfter = process.memoryUsage();

            memorySnapshots.push({
                cycle,
                beforeHeap: memBefore.heapUsed,
                afterHeap: memAfter.heapUsed,
                heapDelta: memAfter.heapUsed - memBefore.heapUsed,
                beforeExternal: memBefore.external,
                afterExternal: memAfter.external,
                externalDelta: memAfter.external - memBefore.external
            });

            this.log(`Cycle ${cycle + 1}/${cycles} completed - Heap delta: ${memorySnapshots[cycle].heapDelta} bytes`, 'info');
        }

        // Analyze memory growth
        const totalHeapGrowth = memorySnapshots[memorySnapshots.length - 1].afterHeap -
                               memorySnapshots[0].beforeHeap;

        const avgHeapGrowth = memorySnapshots.reduce((sum, snap) => sum + snap.heapDelta, 0) / cycles;

        return {
            cycles,
            connectionsPerCycle,
            totalHeapGrowth,
            averageHeapGrowthPerCycle: avgHeapGrowth,
            memorySnapshots: memorySnapshots.slice(0, 5), // Sample
            potentialLeak: avgHeapGrowth > 1024 * 1024 // > 1MB average growth per cycle
        };
    }

    cleanup() {
        this.log('🧹 Cleaning up connections...', 'info');

        this.activeConnections.forEach(socket => {
            try {
                socket.disconnect();
            } catch (error) {
                // Ignore cleanup errors
            }
        });

        this.activeConnections = [];
        this.metrics.endTime = performance.now();
    }

    generateReport() {
        const duration = this.metrics.endTime ?
            Math.round(this.metrics.endTime - this.metrics.startTime) : 0;

        return {
            summary: {
                totalDuration: duration,
                connectionsCreated: this.metrics.connectionsCreated,
                connectionsFailed: this.metrics.connectionsFailed,
                connectionSuccessRate: this.metrics.connectionsCreated > 0 ?
                    ((this.metrics.connectionsCreated / (this.metrics.connectionsCreated + this.metrics.connectionsFailed)) * 100).toFixed(2) : 0,
                messagesSent: this.metrics.messagesAent,
                messagesReceived: this.metrics.messagesReceived,
                errorCount: this.metrics.errors.length
            },
            errors: this.metrics.errors.slice(0, 10), // Sample of errors
            timestamp: new Date().toISOString()
        };
    }

    async runFullStressTest() {
        this.log('🎯 Starting comprehensive stress test suite', 'stress');
        this.metrics.startTime = performance.now();

        const results = {};

        try {
            // 1. Rapid connection test
            const connectionCount = await this.rapidConnectionTest(100, 50);
            results.rapidConnections = { successfulConnections: connectionCount };

            await new Promise(resolve => setTimeout(resolve, 2000));

            // 2. Message flood test
            if (this.activeConnections.length >= 10) {
                results.messageFlood = await this.messageFloodTest(50, 20);
            } else {
                this.log('Skipping message flood test - insufficient connections', 'warning');
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            // 3. Connection drop test
            if (this.activeConnections.length >= 20) {
                results.connectionDrop = await this.connectionDropTest(30);
            }

            await new Promise(resolve => setTimeout(resolve, 2000));

            // 4. Reconnection storm test
            results.reconnectionStorm = await this.reconnectionStormTest(25, 200);

            await new Promise(resolve => setTimeout(resolve, 2000));

            // 5. Memory leak test
            results.memoryLeak = await this.memoryLeakTest(5, 10);

        } catch (error) {
            this.log(`Stress test error: ${error.message}`, 'error');
            this.metrics.errors.push(`Stress test error: ${error.message}`);
        } finally {
            this.cleanup();
        }

        results.summary = this.generateReport();

        this.log('🏁 Stress test suite completed', 'success');
        return results;
    }
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const serverUrl = args[0] || 'http://localhost:3001';
    const testType = args[1] || 'full';

    const stressTest = new StressTestSuite(serverUrl);

    let results;

    try {
        switch (testType) {
            case 'connections':
                stressTest.metrics.startTime = performance.now();
                await stressTest.rapidConnectionTest(parseInt(args[2]) || 100);
                stressTest.cleanup();
                results = stressTest.generateReport();
                break;

            case 'flood':
                stressTest.metrics.startTime = performance.now();
                await stressTest.rapidConnectionTest(20, 100);
                await new Promise(resolve => setTimeout(resolve, 1000));
                await stressTest.messageFloodTest(parseInt(args[2]) || 100, parseInt(args[3]) || 30);
                stressTest.cleanup();
                results = stressTest.generateReport();
                break;

            case 'memory':
                stressTest.metrics.startTime = performance.now();
                const memResults = await stressTest.memoryLeakTest(parseInt(args[2]) || 10, parseInt(args[3]) || 20);
                stressTest.cleanup();
                results = { memoryLeak: memResults, summary: stressTest.generateReport() };
                break;

            case 'full':
            default:
                results = await stressTest.runFullStressTest();
                break;
        }

        console.log('\n📊 STRESS TEST RESULTS:');
        console.log(JSON.stringify(results, null, 2));

        process.exit(0);
    } catch (error) {
        console.error('❌ Stress test failed:', error);
        stressTest.cleanup();
        process.exit(1);
    }
}

// Export for programmatic use
module.exports = StressTestSuite;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}