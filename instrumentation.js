const otel = require('@opentelemetry/api')
const {
    MeterProvider,
    PeriodicExportingMetricReader,
    ConsoleMetricExporter
  } = require('@opentelemetry/sdk-metrics');
const { Resource } = require('@opentelemetry/resources');
const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions');
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');

const os = require('os');

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

// CPU Meter readings
const cpuMeter = meterProvider.getMeter('cpu-meter')

let prevCpuTime = process.cpuUsage()

// Gauge to monitor CPU use by CPU time used by process
const cpuGauge = cpuMeter.createObservableGauge('cpu-time', {
    description: 'CPU time',
    unit: 'microseconds'
  })

cpuGauge.addCallback((result) => {
    const usage = process.cpuUsage(prevCpuTime)
    prevCpuTime = usage
    // User CPU time and System CPU time
    // User measures the time taken by app
    result.observe(usage.user)
})

// Memory meter readings
const memoryMeter = meterProvider.getMeter('memory-meter')

// Gauge to monitor memory use as a %
const memoryUsageGauge = memoryMeter.createObservableGauge('memory-usage', {
    description: 'Memory usage',
    unit: '%'
})

memoryUsageGauge.addCallback((result) => {
    const { heapTotal, heapUsed } = process.memoryUsage()
    const totalMemory = os.totalmem()
    const percent = heapTotal / totalMemory
    console.log('percent', percent)
    result.observe(percent)
})

// Gauge to monitor how much heap memory is used by process
const memoryHeapUsed = memoryMeter.createObservableGauge('heap-used', {
    description: 'Heap used',
    unit: 'MB'
})

memoryHeapUsed.addCallback((result) => {
    const {heapTotal, heapUsed} = process.memoryUsage()
    result.observe(heapUsed / 1000000)
})

// Set this MeterProvider to be global to the app being instrumented.
otel.metrics.setGlobalMeterProvider(meterProvider)
