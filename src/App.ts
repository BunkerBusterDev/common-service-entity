import Logger from "utils/Logger";
import WatchdogTimer from 'utils/WatchdogTimer';

class App {

    constructor() {
        // SIGINT 처리
        process.on('SIGINT', this.shutdown.bind(this));

        WatchdogTimer.startWatchdog();
    }

    // 애플리케이션 시작
    public async start(): Promise<void> {
    }

    // 애플리케이션 종료
    private async shutdown(): Promise<void> {
        Logger.info('[App-shutdown]: Received SIGINT. Shutting down gracefully...');
        WatchdogTimer.stopWatchdog();
        process.exit(0);
    }
}

const app = new App();
app.start();