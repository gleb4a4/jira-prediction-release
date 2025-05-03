class ChartOptionsFactory {
  /**
   * Создает базовые настройки для графика
   * @returns {Object} базовые настройки графика
   */
  static createBaseOptions() {
    return {
      chart: {
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        toolbar: {
          show: true,
          tools: {
            download: true
          }
        },
        animations: {
          enabled: true,
          easing: 'easeinout',
          speed: 800
        }
      },
      grid: {
        borderColor: '#E2E8F0',
        strokeDashArray: 4
      },
      tooltip: {
        theme: 'light'
      }
    };
  }

  /**
   * Создает настройки для графика вероятностей
   * @param {Array} categories - массив категорий (названия спринтов)
   * @returns {Object} настройки графика вероятностей
   */
  static createProbabilityChartOptions(categories) {
    const options = this.createBaseOptions();

    return {
      ...options,
      chart: {
        ...options.chart,
        type: 'bar'
      },
      xaxis: {
        categories,
        title: { text: 'Спринты', style: { fontSize: '14px', fontWeight: 500 } }
      },
      yaxis: {
        max: 100,
        title: { text: 'Вероятность (%)', style: { fontSize: '14px', fontWeight: 500 } },
        labels: {
          formatter: function(val) {
            return val.toFixed(0) + '%';
          }
        }
      },
      colors: ['#3B82F6'],
      dataLabels: {
        enabled: true,
        formatter: function(val) {
          return val.toFixed(1) + '%';
        },
        style: {
          fontSize: '12px',
          fontWeight: 500
        }
      },
      tooltip: {
        ...options.tooltip,
        y: {
          formatter: function(val) {
            return val.toFixed(1) + '%';
          }
        }
      },
      plotOptions: {
        bar: {
          borderRadius: 6,
          columnWidth: '70%'
        }
      }
    };
  }

  /**
   * Создает настройки для графика кумулятивных вероятностей
   * @param {Array} categories - массив категорий (названия спринтов)
   * @returns {Object} настройки графика кумулятивных вероятностей
   */
  static createCumulativeChartOptions(categories) {
    const options = this.createBaseOptions();

    return {
      ...options,
      chart: {
        ...options.chart,
        type: 'line'
      },
      xaxis: {
        categories,
        title: { text: 'Спринты', style: { fontSize: '14px', fontWeight: 500 } }
      },
      yaxis: {
        max: 100,
        title: { text: 'Кумулятивная вероятность (%)', style: { fontSize: '14px', fontWeight: 500 } },
        tickAmount: 5,
        labels: {
          formatter: function(val) {
            return val.toFixed(0) + '%';
          }
        }
      },
      colors: ['#F59E0B'],
      markers: {
        size: 6,
        strokeWidth: 0,
        hover: {
          size: 8
        }
      },
      stroke: { curve: 'smooth', width: 4 },
      tooltip: {
        ...options.tooltip,
        y: {
          formatter: function(val) {
            return val.toFixed(1) + '%';
          }
        }
      },
      annotations: {
        yaxis: [
          {
            y: 50,
            borderColor: '#10B981',
            label: {
              borderColor: '#10B981',
              style: { color: '#fff', background: '#10B981', fontSize: '12px', fontWeight: 600 },
              text: 'P50'
            }
          },
          {
            y: 90,
            borderColor: '#EF4444',
            label: {
              borderColor: '#EF4444',
              style: { color: '#fff', background: '#EF4444', fontSize: '12px', fontWeight: 600 },
              text: 'P90'
            }
          }
        ]
      }
    };
  }

  /**
   * Создает настройки для графика динамики работы
   * @returns {Object} настройки графика динамики работы
   */
  static createDynamicsChartOptions() {
    const options = this.createBaseOptions();

    return {
      ...options,
      chart: {
        ...options.chart,
        type: 'line',
        toolbar: {
          ...options.chart.toolbar,
          tools: {
            ...options.chart.toolbar.tools,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        }
      },
      xaxis: {
        type: 'category',
        title: { text: 'Спринты', style: { fontSize: '14px', fontWeight: 500 } }
      },
      yaxis: {
        title: { text: 'Объём работы (ч.)', style: { fontSize: '14px', fontWeight: 500 } },
        labels: {
          formatter: function(val) {
            return val.toFixed(0) + ' ч';
          }
        }
      },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#10B981', '#60A5FA', '#F59E0B', '#EF4444'],
      markers: {
        size: 5,
        hover: {
          size: 7
        }
      },
      legend: {
        position: 'top',
        fontSize: '14px',
        fontWeight: 500,
        itemMargin: {
          horizontal: 10,
          vertical: 5
        }
      },
      tooltip: {
        ...options.tooltip,
        y: {
          formatter: function(val) {
            return val.toFixed(1) + ' ч';
          }
        }
      }
    };
  }
  
  /**
   * Создает настройки для графика залишок роботи по мірі завершення спринтів
   * @returns {Object} настройки графика  залишок роботи по мірі завершення спринтів
   */
  static createBurnDownChartOptions() {
    return {
      chart: {
        type: 'line',
        toolbar: { show: false }
      },
      xaxis: {
        title: { text: 'Спринти' },
        categories: [] // Динамічно оновлюється з runSimulation
      },
      yaxis: {
        title: { text: 'Залишок роботи (годин)' }
      },
      tooltip: {
        x: { show: true }
      },
      colors: ['#DB4437'],
      stroke: { curve: 'smooth', width: 2 }
    };
  }

}

export default ChartOptionsFactory
