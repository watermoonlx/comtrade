
import { TaskManager } from './TaskManager';

async function main() {
    const taskManager = new TaskManager();
    await taskManager.initAsync();
    await taskManager.runAsync();
}

main();