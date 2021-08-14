import * as echarts from 'echarts'

import { getLocaleDtFromTs } from './dt_tools'

import { DepthData } from 'loopring-sdk'

export function getKlineSign(data: any, dataIndex: number, openVal: number, closeVal: number, closeDimIdx: number) {
    var sign;
    if (openVal > closeVal) {
        sign = -1;
    }
    else if (openVal < closeVal) {
        sign = 1;
    }
    else {
        sign = dataIndex > 0
            // If close === open, compare with close of last record
            ? (data[dataIndex - 1][closeDimIdx] <= closeVal ? 1 : -1)
            // No record of previous, set to be positive
            : 1
    }

    return sign;
}

export const genOHLC = (rawData: any[]) => {
    var data: any[] = []

    rawData = rawData.reverse()

    for (var i = 0; i < rawData.length; i++) {
        const ts = rawData[i][0]

        const close_ind = 3

        const open = parseFloat(rawData[i][2]).toFixed(6)
        const high = parseFloat(rawData[i][4]).toFixed(6)
        const low = parseFloat(rawData[i][5]).toFixed(6)
        const close = parseFloat(rawData[i][close_ind]).toFixed(6)

        const volume = parseInt(rawData[i][6])
        const amt = parseFloat(rawData[i][7]).toFixed(2)

        data[i] = [
            getLocaleDtFromTs(ts),
            open, // open
            high, // highest
            low, // lowest
            close,  // close
            volume,
            getKlineSign(data, i, Number(open), Number(close), close_ind) // sign
        ]
    }

    return data
}

export const genOption = (data: any, upColor: string, upBorderColor: string, downColor: string, downBorderColor: string) => {

    return {
        backgroundColor: '#111111',
        dataset: {
            source: data,
        },
        title: {
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                animation: false,
                type: 'cross',
                lineStyle: {
                    color: '#444444',
                    width: 2,
                    opacity: 1
                }
            }
        },
        toolbox: {
            feature: {
            }
        },
        grid: [
            {
                left: '5%',
                right: '5%',
                bottom: 200
            },
            {
                left: '5%',
                right: '5%',
                height: 80,
                bottom: 80
            }
        ],
        xAxis: [
            {
                type: 'category',
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                splitLine: {
                    show: true,
                    lineStyle: {
                        color: ['#373739']
                    }
                },
                splitNumber: 20,
                min: 'dataMin',
                max: 'dataMax'
            },
            {
                type: 'category',
                gridIndex: 1,
                scale: true,
                boundaryGap: false,
                axisLine: { onZero: false },
                axisTick: { show: false },
                splitLine: { show: false },
                axisLabel: { show: false },
                splitNumber: 50,
                min: 'dataMin',
                max: 'dataMax'
            }
        ],
        yAxis: [
            {
                scale: true,
                splitArea: {
                    show: false
                }
            },
            {
                scale: true,
                gridIndex: 1,
                splitNumber: 2,
                axisLabel: { show: false },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { show: false }
            }
        ],
        dataZoom: [
            {
                type: 'inside',
                xAxisIndex: [0, 1],
                start: 10,
                end: 100
            },
            {
                show: false,
                xAxisIndex: [0, 1],
                type: 'slider',
                bottom: 10,
                start: 10,
                end: 100
            }
        ],
        visualMap: {
            show: false,
            seriesIndex: 1,
            dimension: 6,
            pieces: [{
                value: 1,
                color: upColor
            }, {
                value: -1,
                color: downColor
            }]
        },
        series: [
            {
                type: 'candlestick',
                itemStyle: {
                    color: upColor,
                    color0: downColor,
                    borderColor: upBorderColor,
                    borderColor0: downBorderColor
                },
                encode: {
                    x: 0,
                    y: [1, 4, 3, 2]
                }
            },
            {
                name: 'Volume',
                type: 'bar',
                xAxisIndex: 1,
                yAxisIndex: 1,
                itemStyle: {
                    color: '#7fbe9e'
                },
                large: true,
                encode: {
                    x: 0,
                    y: 5
                }
            }
        ]
    }

}

export const genDepthOption = (data: DepthData, upColor: string, downColor: string, alpha: string = '00') => {
    
    if (!data) {
        return {}
    }

    var a_xdata = [...data.asks_prices].reverse()
    var a_ydata = [...data.asks_amtTotals].reverse()
    var b_xdata = [...data.bids_prices].reverse()
    var b_ydata = [...data.bids_amtTotals].reverse()

    //console.log('a_xdata:', a_xdata)
    //console.log('b_xdata:', b_xdata)

    const xdata = b_xdata?.concat(a_xdata)
    const new_b_ydata = b_ydata.concat(new Array(a_ydata.length).fill(0))
    const new_a_ydata = new Array(b_ydata.length).fill(0).concat(a_ydata)

    return {
        tooltip: {
            trigger: 'axis',
            position: function (pt: any) {
                return [pt[0], '10%'];
            }
        },
        title: {
        },
        toolbox: {
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data: xdata,
            min: 'dataMin',
            max: 'dataMax'
        }],
        yAxis: {
            type: 'value',
            boundaryGap: [0, '100%']
        },
        dataZoom: [{
            type: 'inside',
            start: 0,
            end: 1000
        }, {
            show: false,
            start: 0,
            end: 1000
        }],
        series: [
            {
                name: 'ask',
                type: 'line',
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: {
                    color: upColor + alpha
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: upColor
                    }, {
                        offset: 1,
                        color: upColor
                    }])
                },
                data: new_a_ydata
            },
            {
                name: 'bid',
                type: 'line',
                symbol: 'none',
                sampling: 'lttb',
                itemStyle: {
                    color: downColor + alpha
                },
                areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
                        offset: 0,
                        color: downColor
                    }, {
                        offset: 1,
                        color: downColor
                    }])
                },
                data: new_b_ydata
            }
        ]
    }
}