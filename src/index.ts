import { initDownloadDir } from './dirUtils';
import { TaskManager } from './TaskManager';

async function main() {
    // 初始化下载目录
    initDownloadDir();

    await new TaskManager().runAsync();
}

main();

