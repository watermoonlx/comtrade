import { reporterAreas } from '../assets/reporterAreas';
import { partnerAreas } from '../assets/partnerAreas';
import { tradeAreaNames } from '../assets/贸易主体';
import * as _ from 'lodash';

export interface area {
    id: string;
    text: string;
}

export function getReporters() {
    return reporterAreas.filter(i => _.includes(tradeAreaNames, i.text));
}

export function getPartners() {
    return partnerAreas.filter(i => _.includes(tradeAreaNames, i.text));
}