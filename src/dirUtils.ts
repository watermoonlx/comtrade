import * as fs from 'fs';
import * as path from 'path';
import * as sh from 'shelljs';
import { getReporters } from './tradeArea';

export function prepareDir(year: number) {
    const yearDirPath = buildYearPath(year);

    if (fs.existsSync(yearDirPath)) {
        sh.rm('-rf', yearDirPath);
    }
    fs.mkdirSync(yearDirPath);
    fs.mkdirSync(path.resolve(yearDirPath, 'imports'));
    fs.mkdirSync(path.resolve(yearDirPath, 'exports'));
}

export function buildCsvPath(year: number, flow: 'imports' | 'exports', areaName: string) {
    const yearDirPath = buildYearPath(year);
    const csvPath = path.resolve(yearDirPath, flow, `${areaName}.csv`);
    return csvPath;
}

function buildYearPath(year: number) {
    const yearDirPath = path.resolve(process.cwd(), 'downloads', year.toString());
    return yearDirPath;
}