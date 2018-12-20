import { appConfig } from '../app.config';
import { getReporters } from './tradeArea';
import { Task } from './Task';

export class TaskManager {

    private taskList: Task[] = [];

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

    constructor() {
        this.initTasks();
    }

    async runAsync() {
        console.log(`开始。任务总数: ${this.totalTaskCount}.`);
        while (this.sleepingTaskCount > 0) {
            console.log(`进度: ${this.completedTaskCount / this.totalTaskCount * 100}%.`);
            console.log(`已完成任务: ${this.completedTaskCount}, 未完成任务：${this.sleepingTaskCount}, 正在执行中的任务: ${this.runningTaskCount}. `);
            if (this.runningTaskCount < appConfig.parallelTaskCount) {
                const task = this.nextTask();
                task!.runAsync('');
            }
            await this.delayAsync(1);
        }
    }

    private initTasks() {
        console.log(`初始化任务...`);
        for (let year = appConfig.startYear; year <= appConfig.endYear; year += appConfig.yearStep) {
            for (const area of getReporters()) {
                this.taskList.push(new Task(year, area, 'imports'));
                this.taskList.push(new Task(year, area, 'exports'));
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