import { EChartsOption } from 'echarts'
// import { Echart } from '@/components/Echart'
export const gaugeOptions: EChartsOption = {
  series: [
    {
      type: 'gauge',
      radius: '80%', //修改表盘大小
      title: {
        show: true, //控制表盘title(今日预计用电量)字体是否显示
        fontSize: 14, //控制表盘title(今日预计用电量)字体大小
        // 'color': 'red',           		//控制表盘title(今日预计用电量)字体颜色
        offsetCenter: [0, '40%'] //设置表盘title(今日预计用电量)位置
      },
      axisLine: {
        show: true,
        lineStyle: {
          // 属性lineStyle控制线条样式
          color: [
            [0.3, '#4dabf7'],
            [0.6, '#69db7c'],
            [0.8, '#ffa94d'],
            [1, '#ff6b6b']
          ]
        }
      },
      detail: {
        valueAnimation: true,
        formatter: '{value} %',
        // textStyle: {
        //   fontSize: 36,
        //   color: 'red'
        // },
        offsetCenter: ['0', '80%'] //表盘数据(30%)位置
      }
      // data: [
      //   {
      //     value: 15,
      //     name: 'CPU使用率'
      //   }
      // ]
    }
  ]
}

export const generateGaugeOptions = ({
  percentage,
  name
}: {
  percentage: number | string
  name: string
}) => {
  const newGaugeOptions = gaugeOptions as EChartsOption
  newGaugeOptions.series![0]!.data = [{ value: Number(percentage), name }]
  return newGaugeOptions as EChartsOption
}
