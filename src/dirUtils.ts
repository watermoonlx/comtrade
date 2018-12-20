import * as fs from 'fs';
import * as path from 'path';
import { appConfig } from '../app.config';

let downloadDir = 'downloads';

export function initDownloadDir() {

    downloadDir = path.resolve(process.cwd(), appConfig.downloadPath);
    if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir);
    }

    for (let year = appConfig.startYear; year <= appConfig.endYear; year += appConfig.yearStep) {
        const yearDirPath = buildYearPath(year);
        if (!fs.existsSync(yearDirPath)) {
            fs.mkdirSync(yearDirPath);
        }

        const importsDirPath = path.resolve(yearDirPath, 'imports')
        if (!fs.existsSync(importsDirPath)) {
            fs.mkdirSync(importsDirPath);
        }

        const exportsDirPath = path.resolve(yearDirPath, 'exports');
        if (!fs.existsSync(exportsDirPath)) {
            fs.mkdirSync(exportsDirPath);
        }
    }
}

export function buildCsvPath(year: number, flow: 'imports' | 'exports', areaName: string) {
    const yearDirPath = buildYearPath(year);
    const csvPath = path.resolve(yearDirPath, flow, `${areaName}.csv`);
    return csvPath;
}

function buildYearPath(year: number) {
    const yearDirPath = path.resolve(downloadDir, year.toString());
    return yearDirPath;
}