
import * as request from 'superagent';
import * as cheerio from 'cheerio';
import * as _ from 'lodash';

export class ProxyPool {

    private pool: Proxy[] = [];

    private _page = 1;
    private _lastUpdateTime = new Date();

    get poolSize() {
        return this.pool.length;
    }

    get lastUpdateTime() {
        return this._lastUpdateTime;
    }

    async initAsync() {
        await this.setIpListAsync();

        if (this.pool.length === 0) {
            throw new Error('ip池初始化失败，请重启。');
        }

        setInterval(async () => {
            this._page = 1;
            await this.setIpListAsync();
        }, 300000);

        setInterval(() => {
            this.cleanPool();
        }, 10000);
    }

    getRandomProxy() {
        const index = Math.floor(Math.random() * this.pool.length);
        return this.pool[index];
    }

    private async setIpListAsync() {
        const newProxyList: Proxy[] = [];
        const headers = {
            "Host": "www.xicidaili.com",
            "Connection": "keep-alive",
            "Cache-Control": "no-cache",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "X-Requested-With": "XMLHttpRequest",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.110 Safari/537.36",
            "Accept-Language": "zh-CN,zh;q=0.9"
        };
        const res = await request
            .get(`http://www.xicidaili.com/wt/${++this._page}`)
            .set(headers);
        const $ = cheerio.load(res.text);
        $('table#ip_list tr:not(:first-child)').each((index, elem) => {
            const tds = $(elem).children('td');

            const ip = (tds[1].childNodes[0].data as string).trim();
            const port = (tds[2].childNodes[0].data as string).trim();
            const anonymous = (tds[4].childNodes[0].data as string).trim();
            const protocol = (tds[5].childNodes[0].data as string).trim().toLowerCase();
            const speed = _.trimStart($(tds[6]).find('.bar_inner')[0].attribs.class, 'bar_inner ').trim().toLowerCase();

            if (anonymous === '高匿'
                && protocol === 'http'
                && (speed === 'fast' || speed === 'medium')
            ) {
                newProxyList.push(new Proxy(protocol, ip, port));
            }

        });
        this.pool = _.unionBy(this.pool, newProxyList, p => p.address);
        this._lastUpdateTime = new Date();
    }

    private cleanPool() {
        this.pool = this.pool.filter(i => i.isAlive);
        if (this.pool.length <= 10) {
            this.initAsync();
        }
    }
}

export class Proxy {

    private _failedTimes = 0;

    get address() {
        return `${this.protocol}://${this.ip}:${this.port}`;
    }

    get isAlive() {
        return this._failedTimes < 1;
    }

    constructor(
        private protocol: 'http' | 'https',
        private ip: string,
        private port: string
    ) {
    }

    succeed() {
        this._failedTimes = 0;
    }

    fail() {
        this._failedTimes++;
    }
}
