import { area } from './tradeArea';
import { appConfig } from '../app.config';
import * as request from 'superagent';
import { buildCsvPath } from './dirUtils';
import * as fs from 'fs';
import { ProxyPool } from './proxyPool';
const extendProxy = require('superagent-proxy');

extendProxy(request);

export class Task {

    private _status: 'sleeping' | 'running' | 'completed' = 'sleeping';
    public get status() {
        return this._status;
    }

    private get requestUrl() {
        const tradeRegime = this.flow === 'imports' ? 1 : 2;
        const url = `${appConfig.baseUrl}?max=50000&type=C&freq=A&px=HS&ps=${this.year}&r=${this.area.id}&p=all&rg=${tradeRegime}&cc=${appConfig.classificationCode}&fmt=csv`;

        return url;
    }

    private get filePath() {
        return buildCsvPath(this.year, this.flow, this.area.text);
    }

    constructor(
        public year: number,
        public area: area,
        public flow: 'imports' | 'exports',
        private proxyPool: ProxyPool
    ) {
    }

    async runAsync() {
        if (this.status != 'sleeping')
            return;

        console.log('=======================================================================');
        console.log(`任务开始: ${this.year}, ${this.area.text}, ${this.flow} ...`);

        try {
            this._status = 'running';

            console.log('开始获取数据...');
            const data = await this.getDataAsync();
            console.log('获取数据成功。开始保存...');
            this.saveData(data);
            this._status = 'completed';
            console.log(`任务成功结束: ${this.year}, ${this.area.text}, ${this.flow}.`);
            console.log('=======================================================================');
        }
        catch (err) {
            console.error(`任务出错。错误信息: ${JSON.stringify(err)}.`);
            console.log(err);
            console.log('=======================================================================');
            this._status = 'sleeping';
        }
    }

    private async getDataAsync() {
        const headers = {
            "Host": "comtrade.un.org",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.9"
        };

        let res: any;
        const proxyIP = this.proxyPool.getRandomProxy();
        console.log(`代理：${proxyIP.address}.`)

        try {
            res = await (request
                .get(this.requestUrl)
                .set(headers) as any
            )
                .proxy(proxyIP.address);
        }
        catch (err) {
            proxyIP.fail();
            throw err;
        }
        proxyIP.succeed();
        return res.text;
    }

    private saveData(data: any) {
        const csv = fs.createWriteStream(this.filePath);
        csv.end(data);
    }
};