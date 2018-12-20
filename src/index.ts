import * as fs from 'fs';
import * as path from 'path';
import * as request from 'superagent';
import * as sh from 'shelljs';
import { getReporters, area } from './tradeArea';
import { prepareDir, buildCsvPath } from './dirUtils';
import { taskQueue } from './takeQueue';

async function main() {

    for (let year = 2017; year >= 2007; year--) {
        prepareDir(year);
    }

    for (const task of taskQueue()) {
        try {
            console.log('===================================================================')
            console.log(`开始task:${JSON.stringify(task)}...`);
            console.log(`获取远程数据...`);
            const importData = await getDataAsync(task.year, task.area, task.flow);
            console.log(`获取数据成功，开始保存...`);
            saveData(task.year, task.area, task.flow, importData);
            console.log(`保存成功，task结束.`);
            task.done();

            const delayTime = 40;
            console.log(`等待${delayTime}s后开始下一个任务`);
            await delayAsync(delayTime);
            
            console.log('===================================================================')
        }
        catch (e) {
            console.log(`task出错。`)
            console.log(`task: ${JSON.stringify(task)}.`);
            console.log(`err: ${e}`);
            console.log(e);
            console.log(`等待五分钟后重试...`);
            
            const delayTime = 300;
            console.log(`等待${delayTime}s后开始下一个任务`);
            await delayAsync(delayTime);

            console.log(`等待结束，开始重试...`);
            console.log('===================================================================')
            continue;
        }
    }
}

async function getDataAsync(year: number, area: area, flow: 'imports' | 'exports') {
    const url = buildUrl(year, area, flow);
    const res = await request.get(url);
    return res.text;
}

function buildUrl(year: number, area: area, flow: 'imports' | 'exports') {
    const tradeRegime = flow === 'imports' ? 1 : 2;
    const base = 'http://comtrade.un.org/api/get';
    const url = `${base}?max=50000&type=C&freq=A&px=HS&ps=${2017}&r=${area.id}&p=all&rg=${tradeRegime}&cc=8542&fmt=csv`;

    return url;
}

function saveData(year: number, area: area, flow: 'imports' | 'exports', data: any) {
    const csvPath = buildCsvPath(year, flow, area.text);
    const csv = fs.createWriteStream(csvPath);
    csv.end(data);
}

async function delayAsync(seconds: number) {
    await new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });

    return;
}

main();

