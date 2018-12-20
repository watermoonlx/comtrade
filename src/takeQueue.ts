import { getReporters, area } from './tradeArea';
import * as _ from 'lodash';

export class task {
    public isDone: boolean = false;
    constructor(
        public year: number,
        public area: area,
        public flow: 'imports' | 'exports'
    ) {
    }

    done() {
        this.isDone = true;
    }
};

export function taskQueue() {
    const queue: task[] = [];

    for (let year = 2017; year >= 2007; year--) {
        for (const a of getReporters()) {
            queue.push(new task(year, a, 'imports'));
            queue.push(new task(year, a, 'exports'));
        }
    }

    return (function* () {
        while (true) {
            const notDoneTask = queue.find(i => !i.isDone);
            if (notDoneTask) {
                yield notDoneTask;
            } else {
                return;
            }
        }
    }());
}