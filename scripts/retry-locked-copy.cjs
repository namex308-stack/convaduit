"use strict";

const fs = require("fs");

const RETRY_CODES = new Set(["EBUSY", "EPERM", "EACCES", "ETXTBSY"]);
const MAX_ATTEMPTS = 16;

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function isLockError(err) {
  return Boolean(err && RETRY_CODES.has(err.code));
}

function unlinkQuiet(file) {
  try {
    fs.unlinkSync(file);
  } catch {
    // Dest may not exist yet, or the locker still holds it.
  }
}

function copyViaReadWrite(src, dest) {
  const data = fs.readFileSync(src);
  const tmp = `${dest}.${process.pid}.tmp`;
  try {
    fs.writeFileSync(tmp, data);
    try {
      fs.renameSync(tmp, dest);
    } catch (err) {
      unlinkQuiet(tmp);
      if (!isLockError(err)) throw err;
      unlinkQuiet(dest);
      fs.writeFileSync(dest, data);
    }
  } catch (err) {
    unlinkQuiet(tmp);
    throw err;
  }
}

function logRetry(src, dest, err, attempt) {
  if (attempt < 2 && !String(src).includes("required-server-files")) return;
  console.warn(
    `[retry-locked-copy] ${err.code} copying ${src} -> ${dest} (attempt ${attempt})`
  );
}

function withRetrySync(src, dest, copyOnce, allowReadWrite = false) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      return copyOnce();
    } catch (err) {
      lastErr = err;
      if (!isLockError(err) || attempt === MAX_ATTEMPTS) throw err;
      logRetry(src, dest, err, attempt);
      if (allowReadWrite) unlinkQuiet(dest);
      sleep(Math.min(80 * attempt, 1000));
      if (allowReadWrite && attempt >= 3) {
        try {
          copyViaReadWrite(src, dest);
          return;
        } catch (fallbackErr) {
          lastErr = fallbackErr;
          if (!isLockError(fallbackErr)) throw fallbackErr;
        }
      }
    }
  }
  throw lastErr;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetryAsync(src, dest, copyOnce, allowReadWrite = false) {
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      await copyOnce();
      return;
    } catch (err) {
      lastErr = err;
      if (!isLockError(err) || attempt === MAX_ATTEMPTS) throw err;
      logRetry(src, dest, err, attempt);
      if (allowReadWrite) unlinkQuiet(dest);
      await delay(Math.min(80 * attempt, 1000));
      if (allowReadWrite && attempt >= 3) {
        try {
          copyViaReadWrite(src, dest);
          return;
        } catch (fallbackErr) {
          lastErr = fallbackErr;
          if (!isLockError(fallbackErr)) throw fallbackErr;
        }
      }
    }
  }
  throw lastErr;
}

function patchFs() {
  if (fs.copyFile.__convaduitRetry) return;

  const origCopyFileSync = fs.copyFileSync.bind(fs);
  fs.copyFileSync = function copyFileSyncRetry(src, dest, mode) {
    return withRetrySync(src, dest, () => origCopyFileSync(src, dest, mode), true);
  };

  const origCopyFile = fs.copyFile.bind(fs);
  function copyFileRetry(src, dest, mode, callback) {
    if (typeof mode === "function") {
      callback = mode;
      mode = 0;
    }
    if (typeof callback !== "function") {
      return origCopyFile(src, dest, mode, callback);
    }
    const attemptCopy = (attempt) => {
      origCopyFile(src, dest, mode ?? 0, (err) => {
        if (!err) {
          callback(null);
          return;
        }
        if (!isLockError(err) || attempt >= MAX_ATTEMPTS) {
          callback(err);
          return;
        }
        logRetry(src, dest, err, attempt);
        unlinkQuiet(dest);
        setTimeout(() => {
          if (attempt >= 3) {
            try {
              copyViaReadWrite(src, dest);
              callback(null);
              return;
            } catch (fallbackErr) {
              if (!isLockError(fallbackErr) || attempt + 1 >= MAX_ATTEMPTS) {
                callback(fallbackErr);
                return;
              }
            }
          }
          attemptCopy(attempt + 1);
        }, Math.min(80 * attempt, 1000));
      });
    };
    attemptCopy(1);
  }
  copyFileRetry.__convaduitRetry = true;
  fs.copyFile = copyFileRetry;

  if (fs.promises?.copyFile) {
    const origPromisesCopyFile = fs.promises.copyFile.bind(fs.promises);
    fs.promises.copyFile = async function copyFilePromisesRetry(src, dest, mode) {
      await withRetryAsync(src, dest, () => origPromisesCopyFile(src, dest, mode), true);
    };
  }

  if (typeof fs.cpSync === "function") {
    const origCpSync = fs.cpSync.bind(fs);
    fs.cpSync = function cpSyncRetry(src, dest, opts) {
      return withRetrySync(src, dest, () => origCpSync(src, dest, opts), false);
    };
  }

  if (typeof fs.cp === "function") {
    const origCp = fs.cp.bind(fs);
    fs.cp = function cpRetry(src, dest, opts, callback) {
      if (typeof opts === "function") {
        callback = opts;
        opts = undefined;
      }
      if (typeof callback === "function") {
        withRetryAsync(src, dest, () => origCp(src, dest, opts), false)
          .then(() => callback(null))
          .catch((err) => callback(err));
        return;
      }
      return withRetryAsync(src, dest, () => origCp(src, dest, opts), false);
    };
  }

  if (fs.promises?.cp) {
    const origPromisesCp = fs.promises.cp.bind(fs.promises);
    fs.promises.cp = async function cpPromisesRetry(src, dest, opts) {
      await withRetryAsync(src, dest, () => origPromisesCp(src, dest, opts), false);
    };
  }
}

patchFs();
