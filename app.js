const express = require("express");
const opentelemetry = require("@opentelemetry/api");

const PORT = parseInt(process.env.PORT || "8080");
const app = express();

const tracer = opentelemetry.trace.getTracer(
    'my-service-tracer'
  );  

// Create a span. A span must be closed.
tracer.startActiveSpan('main', span => {
    for (let i = 0; i < 10; i += 1) {
      console.log(i)
    }
  
    // Be sure to end the span!
    span.end();
  });


app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(PORT, () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});