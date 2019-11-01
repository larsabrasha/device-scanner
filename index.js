// On Linux install bluetooth support like this:
// sudo apt-get install bluetooth bluez libbluetooth-dev libudev-dev

const noble = require("noble-mac");
const fs = require("fs");
const { device } = require("./device");

// const scanInterval = 5 * 60 * 1000; // every five minutes
// const scanInterval = 5000; // every five seconds
const scanInterval = 60000; // every minute
const maxNumberOfFailedConnections = 3;
const logFile = "devicelog.txt";

var lastTimeLarsAppleWatchWasFound = null;
var isCheckedIn = false;
var numberOfFailedConnections = 0;

var refreshIntervalId = null;

noble.on("stateChange", function(state) {
  console.log(`${getTime()}`, state);

  if (state === "poweredOn") {
    noble.startScanning();

    refreshIntervalId = setInterval(() => {
      updateStatus(new Date());
      noble.startScanning();
    }, scanInterval);
  } else {
    clearInterval(refreshIntervalId);
    noble.stopScanning();
  }
});

noble.on("scanStart", () => {
  console.log(`${getTime()} Scanning started`);
});

noble.on("scanStop", () => {
  console.log(`${getTime()} Scanning stopped`);
});

noble.on("discover", function(peripheral) {
  if (peripheral.id === device.id) {
    const now = new Date();
    console.log(`${formatTime(now)} Device was found`);
    lastTimeLarsAppleWatchWasFound = now;
    updateStatus(now);

    noble.stopScanning();
  }
});

function updateStatus(now) {
  if (isCheckedIn === true) {
    if (
      now.getTime() - lastTimeLarsAppleWatchWasFound.getTime() >
      scanInterval
    ) {
      numberOfFailedConnections++;
      console.log(
        `${getTime()} # of failed connections: ${numberOfFailedConnections}`
      );

      if (numberOfFailedConnections >= maxNumberOfFailedConnections) {
        logStatusChange(now, "Status change: Device was lost");
        isCheckedIn = false;
        lastTimeLarsAppleWatchWasFound = null;
        numberOfFailedConnections = 0;
      }
    }
  } else {
    if (lastTimeLarsAppleWatchWasFound != null) {
      logStatusChange(now, "Status change: Device was found");
      isCheckedIn = true;
      numberOfFailedConnections = 0;
    }
  }
}

function logStatusChange(date, status) {
  const message = `${formatTime(date)} ${status}`;
  console.log(message);
  fs.appendFile(logFile, `${message}\n`, function(err) {
    if (err) throw err;
  });
}

function formatTime(date) {
  var year = date.getFullYear();
  var month = date.getMonth() + 1;
  var day = date.getDate();
  var hour = date.getHours();
  var minute = date.getMinutes();
  var second = date.getSeconds();

  if (month.toString().length == 1) {
    month = "0" + month;
  }

  if (day.toString().length == 1) {
    day = "0" + day;
  }

  if (hour.toString().length == 1) {
    hour = "0" + hour;
  }

  if (minute.toString().length == 1) {
    minute = "0" + minute;
  }

  if (second.toString().length == 1) {
    second = "0" + second;
  }

  var dateTime =
    year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  return dateTime;
}

function getTime() {
  var now = new Date();
  return formatTime(now);
}
