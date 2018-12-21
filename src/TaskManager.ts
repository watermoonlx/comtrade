import { appConfig } from '../app.config';
import { getReporters } from './tradeArea';
import { Task } from './Task';
import { initDownloadDir } from './dirUtils';
import { ProxyPool } from './proxyPool';
export class TaskManager {

    private taskList: Task[] = [];
    private proxyPool = new ProxyPool();

    get totalTaskCount() {
        return this.taskList.length;
    }

    get sleepingTaskCount() {
        return this.taskList.filter(i => i.status === 'sleeping').length;
    }

    get runningTaskCount() {
        return this.taskList.filter(i => i.status === 'running').length;
    }

    get completedTaskCount() {
        return this.taskList.filter(i => i.status === 'completed').length;
    }

    async initAsync() {
        try {
            initDownloadDir();
            await this.proxyPool.initAsync();
            this.initTasks();
        }
        catch (err) {
            console.error('初始化失败，请重启应用!');
            throw err;
        }
    }

    async runAsync() {
        console.log(`开始。任务总数: ${this.totalTaskCount}.`);
        while (this.sleepingTaskCount > 0) {
            if (this.runningTaskCount <= appConfig.parallelTaskCount) {
                console.log(`进度: ${this.completedTaskCount / this.totalTaskCount * 100}%.`);
                console.log(`已完成任务: ${this.completedTaskCount}，未完成任务：${this.sleepingTaskCount}。正在执行中的任务: ${this.runningTaskCount}。 `);
                console.log(`当前可用代理IP数：${this.proxyPool.poolSize}，上次更新时间: ${this.proxyPool.lastUpdateTime}。 `);
                const task = this.nextTask();
                task!.runAsync();
            } else {
                await this.delayAsync(2);
            }
        }
        console.log('任务全部完成！');
    }

    private initTasks() {
        console.log(`初始化任务...`);
        for (let year = appConfig.startYear; year <= appConfig.endYear; year += appConfig.yearStep) {
            for (const area of getReporters()) {
                this.taskList.push(new Task(year, area, 'imports', this.proxyPool));
                this.taskList.push(new Task(year, area, 'exports', this.proxyPool));
            }
        }
        console.log(`初始化完成。一共有${this.totalTaskCount}个任务。`);
    }

    private nextTask() {
        const nextTask = this.taskList.find(i => i.status === 'sleeping');
        return nextTask;
    }

    private async delayAsync(seconds: number) {
        await new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve();
            }, seconds * 1000);
        });

        return;
    }
}