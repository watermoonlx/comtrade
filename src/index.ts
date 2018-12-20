
import { TaskManager } from './TaskManager';

async function main() {
    const taskManager = new TaskManager();
    taskManager.init();
    await taskManager.runAsync();
}

main();

