const otel = require('@opentelemetry/api')
const {
    MeterProvider,
    PeriodicExportingMetricReader,
    ConsoleMetricExporter
  } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');

const os = require('os-utils');

const metricExporter = new OTLPMetricExporter({});

const meterProvider = new MeterProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: 'process-metrics',
    }),
  });

const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,

    // Default is 60000ms (60 seconds). Set to 3 seconds for demonstrative purposes only.
    exportIntervalMillis: 3000,
});



meterProvider.addMetricReader(metricReader);

const meter = meterProvider.getMeter('example-meter')

// const cpuGauge = meter.createObservableGauge('cpu-usage', {
//     description: 'CPU Usage',
//     unit: '%'
//   })

// cpuGauge.addCallback(() => {
//     let usage;
//     os.cpuUsage().then((v) => {
//         console.log('v', v)
//         return v
//     })
//     // console.log('usage', usage)
//     // return usage
// })

const memoryGauge = meter.createObservableGauge('memory-usage', {
    description: 'Memory usage',
    unit: '%'
})

memoryGauge.addCallback((result) => {
    const { heapTotal, heapUsed } = process.memoryUsage()
    percent = heapUsed / heapTotal
    console.log('percent', percent)
    result.observe(percent)
})

// Set this MeterProvider to be global to the app being instrumented.
otel.metrics.setGlobalMeterProvider(meterProvider)
