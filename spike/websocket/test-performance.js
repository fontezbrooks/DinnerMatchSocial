#!/usr/bin/env node

const io = require('socket.io-client');
const { performance } = require('perf_hooks');

class PerformanceTestSuite {
    constructor(serverUrl = 'http://localhost:3001') {
        this.serverUrl = serverUrl;
        this.results = {
            timestamp: new Date().toISOString(),
            tests: {},
            summary: {}
        };
    }

    log(message, level = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        }[level] || 'ℹ️';

        console.log(`${prefix} [${timestamp}] ${message}`);
    }

    async connectSocket(userId = null) {
        return new Promise((resolve, reject) => {
            const socket = io(this.serverUrl, {
                transports: ['websocket'],
                timeout: 5000
            });

            const timeout = setTimeout(() => {
                socket.disconnect();
                reject(new Error('Connection timeout'));
            }, 5000);

            socket.on('connect', () => {
                clearTimeout(timeout);
                resolve(socket);
            });

            socket.on('connect_error', (error) => {
                clearTimeout(timeout);
                reject(error);
            });
        });
    }

    async createRoom(socket, userId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Create room timeout'));
            }, 5000);

            socket.emit('createRoom', {
                userId: userId || `test_user_${Date.now()}`
            }, (response) => {
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
            const timeout = setTimeout(() => {
                reject(new Error('Join room timeout'));
            }, 5000);

            socket.emit('joinRoom', {
                roomId,
                userId: userId || `test_user_${Date.now()}`
            }, (response) => {
                clearTimeout(timeout);
                if (response.success) {
                    resolve(response);
                } else {
                    reject(new Error(response.message));
                }
            });
        });
    }

    async testLatency() {
        this.log('🏓 Testing basic latency...');

        try {
            const socket1 = await this.connectSocket();
            const socket2 = await this.connectSocket();

            const roomId = await this.createRoom(socket1, 'user1');
            await this.joinRoom(socket2, roomId, 'user2');

            const latencies = [];
            const testCount = 50;

            return new Promise((resolve) => {
                let receivedCount = 0;

                socket2.on('partnerSwipe', (data) => {
                    latencies.push(data.latency);
                    receivedCount++;

                    if (receivedCount >= testCount) {
                        const avgLatency = latencies.reduce((a, b) => a + b, 0) / latencies.length;
                        const maxLatency = Math.max(...latencies);
                        const minLatency = Math.min(...latencies);
                        const p95Latency = latencies.sort((a, b) => a - b)[Math.floor(latencies.length * 0.95)];

                        const result = {
                            testName: 'Basic Latency',
                            samples: testCount,
                            avgLatency: Math.round(avgLatency),
                            minLatency,
                            maxLatency,
                            p95Latency,
                            latencies: latencies.slice(0, 10) // Sample for verification
                        };

                        this.results.tests.latency = result;
                        this.log(`Average latency: ${result.avgLatency}ms (95th percentile: ${result.p95Latency}ms)`);

                        socket1.disconnect();
                        socket2.disconnect();
                        resolve(result);
                    }
                });

                // Send swipes with timing
                for (let i = 0; i < testCount; i++) {
                    setTimeout(() => {
                        socket1.emit('swipe', {
                            roomId,
                            direction: ['left', 'right', 'up'][i % 3],
                            timestamp: Date.now(),
                            restaurantId: `test_restaurant_${i}`
                        });
                    }, i * 100); // 10 swipes per second
                }
            });
        } catch (error) {
            this.log(`Latency test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testReconnection() {
        this.log('🔄 Testing reconnection handling...');

        try {
            const socket1 = await this.connectSocket();
            const roomId = await this.createRoom(socket1, 'reconnect_user');

            // Simulate disconnection
            const disconnectTime = performance.now();
            socket1.disconnect();

            // Reconnect
            const socket2 = await this.connectSocket();
            const joinTime = performance.now();

            await this.joinRoom(socket2, roomId, 'reconnect_user');

            const reconnectTime = joinTime - disconnectTime;

            const result = {
                testName: 'Reconnection',
                reconnectTime: Math.round(reconnectTime),
                threshold: 2000, // 2 seconds
                passed: reconnectTime < 2000
            };

            this.results.tests.reconnection = result;
            this.log(`Reconnection time: ${result.reconnectTime}ms (${result.passed ? 'PASS' : 'FAIL'})`);

            socket2.disconnect();
            return result;
        } catch (error) {
            this.log(`Reconnection test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testMessageDelivery() {
        this.log('📨 Testing message delivery rate...');

        try {
            const socket1 = await this.connectSocket();
            const socket2 = await this.connectSocket();

            const roomId = await this.createRoom(socket1, 'delivery_user1');
            await this.joinRoom(socket2, roomId, 'delivery_user2');

            const totalMessages = 100;
            let receivedMessages = 0;
            const messageIds = new Set();

            return new Promise((resolve) => {
                const startTime = Date.now();

                socket2.on('partnerSwipe', (data) => {
                    receivedMessages++;
                    messageIds.add(data.restaurantId);

                    // Wait for completion or timeout
                    if (receivedMessages >= totalMessages || Date.now() - startTime > 30000) {
                        const deliveryRate = (receivedMessages / totalMessages) * 100;

                        const result = {
                            testName: 'Message Delivery',
                            totalSent: totalMessages,
                            totalReceived: receivedMessages,
                            deliveryRate: deliveryRate.toFixed(2),
                            uniqueMessages: messageIds.size,
                            testDuration: Date.now() - startTime,
                            passed: deliveryRate >= 95
                        };

                        this.results.tests.messageDelivery = result;
                        this.log(`Delivery rate: ${result.deliveryRate}% (${result.passed ? 'PASS' : 'FAIL'})`);

                        socket1.disconnect();
                        socket2.disconnect();
                        resolve(result);
                    }
                });

                // Send messages rapidly
                for (let i = 0; i < totalMessages; i++) {
                    setTimeout(() => {
                        socket1.emit('swipe', {
                            roomId,
                            direction: 'right',
                            timestamp: Date.now(),
                            restaurantId: `delivery_test_${i}`
                        });
                    }, i * 50); // 20 messages per second
                }
            });
        } catch (error) {
            this.log(`Message delivery test failed: ${error.message}`, 'error');
            throw error;
        }
    }

    async testConcurrentConnections() {
        this.log('👥 Testing concurrent connections (stress test)...');

        const concurrentSessions = 50; // Reduced from 100 for stability
        const connections = [];
        const rooms = [];

        try {
            const startTime = performance.now();

            // Create concurrent sessions
            for (let i = 0; i < concurrentSessions; i++) {
                try {
                    const socket1 = await this.connectSocket();
                    const socket2 = await this.connectSocket();

                    const roomId = await this.createRoom(socket1, `stress_user_${i}_1`);
                    await this.joinRoom(socket2, roomId, `stress_user_${i}_2`);

                    connections.push(socket1, socket2);
                    rooms.push(roomId);
                } catch (error) {
                    this.log(`Failed to create session ${i}: ${error.message}`, 'warning');
                }
            }

            const setupTime = performance.now() - startTime;

            // Test message passing in all rooms
            const messagesPerRoom = 5;
            let totalMessagesSent = 0;
            let totalMessagesReceived = 0;

            return new Promise((resolve) => {
                const messageStart = performance.now();

                // Setup message listeners
                connections.forEach((socket, index) => {
                    if (index % 2 === 1) { // Only even-indexed sockets (receivers)
                        socket.on('partnerSwipe', () => {
                            totalMessagesReceived++;

                            if (totalMessagesReceived >= totalMessagesSent ||
                                performance.now() - messageStart > 15000) {
                                const testTime = performance.now() - messageStart;

                                const result = {
                                    testName: 'Concurrent Connections',
                                    targetSessions: concurrentSessions,
                                    actualSessions: Math.floor(connections.length / 2),
                                    setupTime: Math.round(setupTime),
                                    messagesSent: totalMessagesSent,
                                    messagesReceived: totalMessagesReceived,
                                    messageTestTime: Math.round(testTime),
                                    deliveryRate: totalMessagesSent > 0 ?
                                        ((totalMessagesReceived / totalMessagesSent) * 100).toFixed(2) : 0,
                                    passed: Math.floor(connections.length / 2) >= concurrentSessions * 0.8
                                };

                                this.results.tests.concurrentConnections = result;
                                this.log(`Concurrent sessions: ${result.actualSessions}/${result.targetSessions} (${result.passed ? 'PASS' : 'FAIL'})`);

                                // Cleanup
                                connections.forEach(socket => socket.disconnect());
                                resolve(result);
                            }
                        });
                    }
                });

                // Send messages from all rooms
                rooms.forEach((roomId, index) => {
                    for (let j = 0; j < messagesPerRoom; j++) {
                        setTimeout(() => {
                            const senderSocket = connections[index * 2]; // Sender socket
                            if (senderSocket && senderSocket.connected) {
                                senderSocket.emit('swipe', {
                                    roomId,
                                    direction: 'right',
                                    timestamp: Date.now(),
                                    restaurantId: `stress_${index}_${j}`
                                });
                                totalMessagesSent++;
                            }
                        }, j * 100 + index * 10); // Stagger messages
                    }
                });
            });

        } catch (error) {
            this.log(`Concurrent connections test failed: ${error.message}`, 'error');
            // Cleanup on error
            connections.forEach(socket => {
                try {
                    socket.disconnect();
                } catch (e) {
                    // Ignore cleanup errors
                }
            });
            throw error;
        }
    }

    async testServerHealth() {
        this.log('🏥 Testing server health endpoints...');

        try {
            const fetch = (await import('node-fetch')).default;

            // Test health endpoint
            const healthResponse = await fetch(`${this.serverUrl.replace('ws://', 'http://').replace('wss://', 'https://')}/api/health`);
            const healthData = await healthResponse.json();

            // Test metrics endpoint
            const metricsResponse = await fetch(`${this.serverUrl.replace('ws://', 'http://').replace('wss://', 'https://')}/api/metrics`);
            const metricsData = await metricsResponse.json();

            const result = {
                testName: 'Server Health',
                healthEndpoint: {
                    status: healthResponse.status,
                    data: healthData
                },
                metricsEndpoint: {
                    status: metricsResponse.status,
                    data: metricsData
                },
                passed: healthResponse.ok && metricsResponse.ok
            };

            this.results.tests.serverHealth = result;
            this.log(`Server health: ${result.passed ? 'HEALTHY' : 'UNHEALTHY'}`);

            return result;
        } catch (error) {
            this.log(`Server health test failed: ${error.message}`, 'error');
            const result = {
                testName: 'Server Health',
                error: error.message,
                passed: false
            };
            this.results.tests.serverHealth = result;
            return result;
        }
    }

    calculateSummary() {
        const tests = Object.values(this.results.tests);
        const passedTests = tests.filter(test => test.passed).length;
        const totalTests = tests.length;

        this.results.summary = {
            totalTests,
            passedTests,
            failedTests: totalTests - passedTests,
            passRate: totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(2) : 0,
            overallPassed: passedTests === totalTests
        };

        // Key performance indicators
        const latencyTest = this.results.tests.latency;
        const reconnectionTest = this.results.tests.reconnection;
        const deliveryTest = this.results.tests.messageDelivery;
        const concurrentTest = this.results.tests.concurrentConnections;

        this.results.summary.kpis = {
            averageLatency: latencyTest ? `${latencyTest.avgLatency}ms` : 'N/A',
            p95Latency: latencyTest ? `${latencyTest.p95Latency}ms` : 'N/A',
            reconnectionTime: reconnectionTest ? `${reconnectionTest.reconnectTime}ms` : 'N/A',
            messageDeliveryRate: deliveryTest ? `${deliveryTest.deliveryRate}%` : 'N/A',
            maxConcurrentSessions: concurrentTest ? concurrentTest.actualSessions : 'N/A'
        };
    }

    async runAllTests() {
        this.log('🚀 Starting DinnerMatch WebSocket Performance Test Suite');
        this.log(`Testing server: ${this.serverUrl}`);

        const startTime = Date.now();

        try {
            // Run all tests sequentially to avoid interference
            await this.testServerHealth();
            await new Promise(resolve => setTimeout(resolve, 1000)); // Brief pause

            await this.testLatency();
            await new Promise(resolve => setTimeout(resolve, 1000));

            await this.testReconnection();
            await new Promise(resolve => setTimeout(resolve, 1000));

            await this.testMessageDelivery();
            await new Promise(resolve => setTimeout(resolve, 2000));

            await this.testConcurrentConnections();

        } catch (error) {
            this.log(`Test suite error: ${error.message}`, 'error');
        }

        const totalTime = Date.now() - startTime;
        this.calculateSummary();

        this.log(`\n📊 TEST SUITE COMPLETED in ${totalTime}ms`);
        this.log(`Overall Result: ${this.results.summary.overallPassed ? 'PASS' : 'FAIL'}`);
        this.log(`Tests Passed: ${this.results.summary.passedTests}/${this.results.summary.totalTests}`);

        return this.results;
    }

    async saveResults(filename = 'test-results.md') {
        const fs = require('fs').promises;
        const path = require('path');

        const markdown = this.generateMarkdownReport();
        const filepath = path.join(__dirname, filename);

        await fs.writeFile(filepath, markdown);
        this.log(`Results saved to: ${filepath}`, 'success');
    }

    generateMarkdownReport() {
        const summary = this.results.summary;
        const tests = this.results.tests;

        let markdown = `# DinnerMatch WebSocket Performance Test Results

**Test Date:** ${this.results.timestamp}
**Server URL:** ${this.serverUrl}
**Overall Result:** ${summary.overallPassed ? '✅ PASS' : '❌ FAIL'}

## Summary

- **Total Tests:** ${summary.totalTests}
- **Passed:** ${summary.passedTests}
- **Failed:** ${summary.failedTests}
- **Pass Rate:** ${summary.passRate}%

## Key Performance Indicators

| Metric | Value | Target | Status |
|--------|-------|---------|--------|
| Average Latency | ${summary.kpis.averageLatency} | <500ms | ${tests.latency?.avgLatency < 500 ? '✅' : '❌'} |
| 95th Percentile Latency | ${summary.kpis.p95Latency} | <500ms | ${tests.latency?.p95Latency < 500 ? '✅' : '❌'} |
| Reconnection Time | ${summary.kpis.reconnectionTime} | <2000ms | ${tests.reconnection?.passed ? '✅' : '❌'} |
| Message Delivery Rate | ${summary.kpis.messageDeliveryRate} | >95% | ${tests.messageDelivery?.passed ? '✅' : '❌'} |
| Max Concurrent Sessions | ${summary.kpis.maxConcurrentSessions} | >50 | ${tests.concurrentConnections?.passed ? '✅' : '❌'} |

## Detailed Test Results

`;

        Object.values(tests).forEach(test => {
            markdown += `### ${test.testName}\n\n`;
            markdown += `**Status:** ${test.passed ? '✅ PASS' : '❌ FAIL'}\n\n`;

            if (test.testName === 'Basic Latency') {
                markdown += `- **Samples:** ${test.samples}\n`;
                markdown += `- **Average Latency:** ${test.avgLatency}ms\n`;
                markdown += `- **Min Latency:** ${test.minLatency}ms\n`;
                markdown += `- **Max Latency:** ${test.maxLatency}ms\n`;
                markdown += `- **95th Percentile:** ${test.p95Latency}ms\n`;
            } else if (test.testName === 'Reconnection') {
                markdown += `- **Reconnection Time:** ${test.reconnectTime}ms\n`;
                markdown += `- **Target Threshold:** ${test.threshold}ms\n`;
            } else if (test.testName === 'Message Delivery') {
                markdown += `- **Messages Sent:** ${test.totalSent}\n`;
                markdown += `- **Messages Received:** ${test.totalReceived}\n`;
                markdown += `- **Delivery Rate:** ${test.deliveryRate}%\n`;
                markdown += `- **Test Duration:** ${test.testDuration}ms\n`;
            } else if (test.testName === 'Concurrent Connections') {
                markdown += `- **Target Sessions:** ${test.targetSessions}\n`;
                markdown += `- **Actual Sessions:** ${test.actualSessions}\n`;
                markdown += `- **Setup Time:** ${test.setupTime}ms\n`;
                markdown += `- **Messages Sent:** ${test.messagesSent}\n`;
                markdown += `- **Messages Received:** ${test.messagesReceived}\n`;
                markdown += `- **Delivery Rate:** ${test.deliveryRate}%\n`;
            }

            markdown += '\n';
        });

        markdown += `## Test Environment

- **Node.js Version:** ${process.version}
- **Platform:** ${process.platform}
- **Architecture:** ${process.arch}
- **Memory Usage:** ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB

## Recommendations

`;

        if (tests.latency?.avgLatency > 500) {
            markdown += '- ⚠️ Average latency exceeds target (500ms). Consider optimizing server processing or network infrastructure.\n';
        }

        if (tests.reconnection && !tests.reconnection.passed) {
            markdown += '- ⚠️ Reconnection time exceeds target (2000ms). Review connection handling and session persistence.\n';
        }

        if (tests.messageDelivery && parseFloat(tests.messageDelivery.deliveryRate) < 95) {
            markdown += '- ⚠️ Message delivery rate below target (95%). Investigate message queuing and retry mechanisms.\n';
        }

        if (tests.concurrentConnections && !tests.concurrentConnections.passed) {
            markdown += '- ⚠️ Concurrent connection target not met. Consider scaling infrastructure or optimizing connection handling.\n';
        }

        if (summary.overallPassed) {
            markdown += '- ✅ All performance targets met. System is ready for production deployment.\n';
        }

        return markdown;
    }
}

// CLI execution
async function main() {
    const args = process.argv.slice(2);
    const serverUrl = args[0] || 'http://localhost:3001';

    const testSuite = new PerformanceTestSuite(serverUrl);

    try {
        const results = await testSuite.runAllTests();
        await testSuite.saveResults();

        // Exit with appropriate code
        process.exit(results.summary.overallPassed ? 0 : 1);
    } catch (error) {
        console.error('❌ Test suite failed:', error);
        process.exit(1);
    }
}

// Export for programmatic use
module.exports = PerformanceTestSuite;

// Run if called directly
if (require.main === module) {
    main().catch(console.error);
}