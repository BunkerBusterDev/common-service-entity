import Delay from 'utils/Delay';
import Logger from 'utils/Logger';
import { startWatchdog, stopWatchdog } from 'utils/WatchdogTimer';

class App {
    private maxRetries;
    private retryCount;
    private delayTime;

    constructor() {
        // SIGINT 처리
        process.on('SIGINT', this.shutdown.bind(this));

        this.maxRetries = 5;
        this.retryCount = 0;
        this.delayTime = 1000;
    }

    // 애플리케이션 종료
    private async shutdown(): Promise<void> {
        Logger.info('[App-shutdown]: Received SIGINT. Shutting down gracefully...');
        stopWatchdog();
        process.exit(0);
    }

    private async restart(): Promise<void> {
        Logger.info('[App-restart]: Restarting application...');
        stopWatchdog();

        // 현재 지연 시간만큼 대기
        this.retryCount++;

        // 최대 재시도 횟수 초과 시 에러 처리
        if (this.retryCount > this.maxRetries) {
            Logger.warn(`[App-restart]: Maximum connection attempts (${this.maxRetries}) exceeded. Retrying in 60 seconds...`);
            
            // 1분 후 재시작
            await Delay(60000); // 60초 대기
            this.retryCount = 1;
            this.delayTime = 1000;
        }

        Logger.info(`[App-restart]: Retrying connection (${this.retryCount}/${this.maxRetries}) in ${this.delayTime}ms...`);
        await Delay(this.delayTime);
        
        // 지수 백오프 계산 (최대 지연 시간 제한)
        this.delayTime = Math.min(this.delayTime * 2, 30000); // 최대 지연 시간 30초
        await this.start();
    }

    // 애플리케이션 시작
    public async start(): Promise<void> {
        startWatchdog();
        try {
        } catch (error) {
            Logger.error(`[App-start]: App start is failed`);
            this.restart();
        }
    }
}

// 애플리케이션 실행
const app = new App();
app.start();