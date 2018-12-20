export interface RequestFormat {
    /** reporting area: the area that reported the trade to UNSD */
    r: string;

    /**  data set frequency */
    freq: 'A' | 'M';

    /** time period */
    ps: string;

    /** classification  */
    px: string;

    /** partner area */
    p: string;

    /** trade regime / trade flow */
    rg: string;

    /** classification code */
    cc: string;

    /** output format */
    fmt: 'json' | 'csv';

    /** maximum records returned */
    max: number;

    /** trade data type. */
    type: 'C' | 'S';

    /** heading style */
    head: 'H' | 'M';

    /** data fields/columns based on IMTS Concepts & Definitions */
    IMTS: string;
}