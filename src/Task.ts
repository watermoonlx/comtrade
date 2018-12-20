import { area } from './tradeArea';
import { appConfig } from '../app.config';
import * as request from 'superagent';
import { buildCsvPath } from './dirUtils';
import * as fs from 'fs';
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
        public flow: 'imports' | 'exports'
    ) {
    }

    async runAsync(proxyIP: string) {
        if (this.status != 'sleeping')
            return;

        console.log(`任务开始: ${JSON.stringify(this)}.`);

        try {
            this._status = 'running';

            const data = await this.getDataAsync(proxyIP);
            this.saveData(data);
            this._status = 'completed';
            console.log(`任务结束: ${JSON.stringify(this)}.`);
        }
        catch (err) {
            console.error(`任务出错。错误信息: ${JSON.stringify(err)}.`);
            console.log(err);
            this._status = 'sleeping';
        }
    }

    private async getDataAsync(proxyIP: string) {
        const res = await (request
            .get(this.requestUrl) as any);
        return res.text;
    }

    private saveData(data: any) {
        const csv = fs.createWriteStream(this.filePath);
        csv.end(data);
    }
};