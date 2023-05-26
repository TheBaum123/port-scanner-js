const yargs = require("yargs")
const isPortReachable = require("is-port-reachable")

const defaultPorts = require("./defaultPorts.json")

const cliOptions = yargs
  .option("h", {
    alias: "host",
    describe: "The host you want to scan",
    type: "string",
    demandOption: true
  })
  .option("d", {
    alias: "default",
    describe: "scan the default ports",
    type: "bool"
  })
  .option("t", {
    alias: "timeout",
    describe: "Set time to wait for scan to finish. Defaults to 1 second. Setting to low might not be able to test all ports.",
    type: "integer"
  })
  .option("f", {
    alias: "sort",
    describe: "sort by \"open\" or \"port\"",
    type: "string"
  })
  .option("s", {
    alias: "start",
    describe: "starting port for custom scans",
    type: "integer"
  })
  .option("e", {
    alias: "end",
    describe: "ending port for custom scans",
    type: "integer"
  })
  .argv

let host = cliOptions.host
let scanDefault = cliOptions.default
let startingPort = cliOptions.start || 2
let endingPort = cliOptions.end || 1
let timeout = cliOptions.timeout || 1
let sort = cliOptions.sort || "open"


let openPorts = []

if (startingPort > endingPort || startingPort < 0 || endingPort < 0) {
  scanDefault = true
}


async function customScan() {
  for (let i = startingPort; i < endingPort + 1; i++) {
    openPorts.push({
      port: i,
      open: await isPortReachable(i, { host: host }) ? "✅" : "❌"
    })
  }
}


function scanPorts() {
  defaultPorts.forEach(async e => {
    openPorts.push({
      port: e.port,
      protocol: e.protocol,
      open: await isPortReachable(e.port, { host: host }) ? "✅" : "❌",
      service: e.name
    })
  })
}

customScan()
if(scanDefault) scanPorts()

setTimeout(() => {
  if (sort == "port") {
    openPorts = openPorts.sort((a, b) => a.port - b.port)
  }
  if (sort == "open") {
    openPorts = openPorts.sort((a, b) => {
      if (a.open == "✅") {
        return 1
      } else {
        return -1
      }
    })
  }
  (console.table(openPorts))
}, timeout * 1000);
