/**
 * Simple integration test for Socket.io server
 * Run with: npx tsx src/test/socket-test.ts
 */

import { io, Socket } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:3001';

interface TestResults {
  connection: boolean;
  authentication: boolean;
  sessionJoin: boolean;
  voting: boolean;
  timer: boolean;
  errors: string[];
}

class SocketTester {
  private socket: Socket | null = null;
  private results: TestResults = {
    connection: false,
    authentication: false,
    sessionJoin: false,
    voting: false,
    timer: false,
    errors: []
  };

  private log(message: string, type: 'info' | 'success' | 'error' = 'info') {
    const prefix = {
      info: '🔍',
      success: '✅',
      error: '❌'
    }[type];
    console.log(`${prefix} ${message}`);
  }

  async testConnection(): Promise<boolean> {
    this.log('Testing connection to Socket.io server...');

    return new Promise((resolve) => {
      const testSocket = io(BACKEND_URL, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      testSocket.on('connect', () => {
        this.log('Connection successful!', 'success');
        this.results.connection = true;
        testSocket.disconnect();
        resolve(true);
      });

      testSocket.on('connect_error', (error) => {
        this.log(`Connection failed: ${error.message}`, 'error');
        this.results.errors.push(`Connection: ${error.message}`);
        resolve(false);
      });

      // Timeout after 10 seconds
      setTimeout(() => {
        this.log('Connection timeout', 'error');
        this.results.errors.push('Connection timeout');
        testSocket.disconnect();
        resolve(false);
      }, 10000);
    });
  }

  async testAuthentication(): Promise<boolean> {
    this.log('Testing authentication...');

    return new Promise((resolve) => {
      // Create test token
      const testToken = 'test_token_' + Date.now();

      const socket = io(BACKEND_URL, {
        auth: { token: testToken },
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      socket.on('connect', () => {
        this.log('Authentication successful!', 'success');
        this.results.authentication = true;
        this.socket = socket;
        resolve(true);
      });

      socket.on('connect_error', (error) => {
        this.log(`Authentication failed: ${error.message}`, 'error');
        this.results.errors.push(`Authentication: ${error.message}`);
        socket.disconnect();
        resolve(false);
      });

      setTimeout(() => {
        this.log('Authentication timeout', 'error');
        this.results.errors.push('Authentication timeout');
        socket.disconnect();
        resolve(false);
      }, 10000);
    });
  }

  async testSessionJoin(): Promise<boolean> {
    if (!this.socket) {
      this.log('No authenticated socket available', 'error');
      return false;
    }

    this.log('Testing session join...');

    return new Promise((resolve) => {
      const testSessionId = 'test_session_' + Date.now();
      let resolved = false;

      // Listen for session state
      this.socket!.on('session_state', (data) => {
        if (!resolved) {
          this.log('Session join successful!', 'success');
          this.results.sessionJoin = true;
          resolved = true;
          resolve(true);
        }
      });

      // Listen for errors
      this.socket!.on('error', (error) => {
        if (!resolved) {
          this.log(`Session join failed: ${error.message}`, 'error');
          this.results.errors.push(`Session join: ${error.message}`);
          resolved = true;
          resolve(false);
        }
      });

      // Join session
      this.socket!.emit('join_session', {
        sessionId: testSessionId,
        token: 'test_token_' + Date.now()
      });

      // Timeout
      setTimeout(() => {
        if (!resolved) {
          this.log('Session join timeout', 'error');
          this.results.errors.push('Session join timeout');
          resolved = true;
          resolve(false);
        }
      }, 10000);
    });
  }

  async testVoting(): Promise<boolean> {
    if (!this.socket) {
      this.log('No authenticated socket available', 'error');
      return false;
    }

    this.log('Testing voting functionality...');

    return new Promise((resolve) => {
      let resolved = false;

      // Listen for vote confirmation
      this.socket!.on('vote_received', (data) => {
        if (!resolved) {
          this.log('Voting test successful!', 'success');
          this.results.voting = true;
          resolved = true;
          resolve(true);
        }
      });

      // Test vote
      const testVote = {
        sessionId: 'test_session_' + Date.now(),
        userId: 'test_user_' + Date.now(),
        itemId: 'test_item_' + Date.now(),
        vote: 'like' as const,
        itemData: {
          id: 'test_item',
          name: 'Test Restaurant',
          rating: 4.5,
        },
      };

      this.socket!.emit('swipe_vote', testVote);

      // Timeout
      setTimeout(() => {
        if (!resolved) {
          this.log('Voting test timeout (this may be expected if session is not active)', 'error');
          this.results.errors.push('Voting timeout');
          resolved = true;
          resolve(false);
        }
      }, 5000);
    });
  }

  async testTimer(): Promise<boolean> {
    if (!this.socket) {
      this.log('No authenticated socket available', 'error');
      return false;
    }

    this.log('Testing timer functionality...');

    return new Promise((resolve) => {
      let resolved = false;

      // Listen for timer events
      this.socket!.on('timer_start', (data) => {
        if (!resolved) {
          this.log('Timer test successful!', 'success');
          this.results.timer = true;
          resolved = true;
          resolve(true);
        }
      });

      this.socket!.on('timer_update', (data) => {
        if (!resolved) {
          this.log('Timer update received!', 'success');
          this.results.timer = true;
          resolved = true;
          resolve(true);
        }
      });

      // Timeout (timers may not be active in test)
      setTimeout(() => {
        if (!resolved) {
          this.log('Timer test timeout (expected if no active session)', 'error');
          this.results.errors.push('Timer timeout');
          resolved = true;
          resolve(false);
        }
      }, 5000);
    });
  }

  async runAllTests(): Promise<TestResults> {
    this.log('🚀 Starting Socket.io integration tests...\n');

    // Test connection
    const connectionOk = await this.testConnection();
    if (!connectionOk) {
      this.log('\n❌ Connection failed, skipping other tests', 'error');
      return this.results;
    }

    // Test authentication
    const authOk = await this.testAuthentication();
    if (!authOk) {
      this.log('\n❌ Authentication failed, skipping other tests', 'error');
      return this.results;
    }

    // Test session join
    await this.testSessionJoin();

    // Test voting (may fail if session not active)
    await this.testVoting();

    // Test timer (may fail if no active session)
    await this.testTimer();

    // Cleanup
    if (this.socket) {
      this.socket.disconnect();
    }

    return this.results;
  }

  printResults(): void {
    this.log('\n📊 Test Results Summary:\n');

    const tests = [
      { name: 'Connection', passed: this.results.connection },
      { name: 'Authentication', passed: this.results.authentication },
      { name: 'Session Join', passed: this.results.sessionJoin },
      { name: 'Voting', passed: this.results.voting },
      { name: 'Timer', passed: this.results.timer },
    ];

    tests.forEach(test => {
      const status = test.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`  ${test.name}: ${status}`);
    });

    const passedTests = tests.filter(t => t.passed).length;
    const totalTests = tests.length;

    this.log(`\n🏆 Tests passed: ${passedTests}/${totalTests}`);

    if (this.results.errors.length > 0) {
      this.log('\n⚠️ Errors encountered:');
      this.results.errors.forEach(error => {
        this.log(`  • ${error}`, 'error');
      });
    }

    if (passedTests === totalTests) {
      this.log('\n🎉 All tests passed! Socket.io server is working correctly.', 'success');
    } else {
      this.log('\n⚠️  Some tests failed. Check server status and configuration.', 'error');
    }
  }
}

// Run tests
async function main() {
  const tester = new SocketTester();

  try {
    await tester.runAllTests();
    tester.printResults();
  } catch (error) {
    console.error('❌ Test execution failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { SocketTester };