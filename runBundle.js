const {exec} = require('child_process');
const lineReader = require('line-reader');
const fs = require('fs');

function getCommand(entryFile, output) {
  return `npx react-native bundle --platform android --dev false --entry-file ${entryFile} --bundle-output ${output} --reset-cache 2>&1`;
}

function runBundle({entry, output}) {
  return new Promise(resolve => {
    exec(
      getCommand(entry, output),
      {cwd: __dirname, maxBuffer: 10 * 1024 * 1024},
      (err, stdout, stderr) => {
        if (err) {
          //some err occurred
          console.error(err);
        } else {
          // the *entire* stdout and stderr (buffered)
          console.log(`stdout: ${stdout}`);
          console.log(`stderr: ${stderr}`);
        }
        resolve();
      },
    );
  });
}

function readBundle(fileName) {
  let preCode = '';
  let initCode = [];
  let modules = [];
  const exists = fs.existsSync(fileName);
  console.log('exists', exists);
  return new Promise((resolve, reject) => {
    lineReader.eachLine(fileName, (line, last) => {
      // console.log('line', line)
      if (!line.startsWith('__d')) {
        if (line.startsWith('__r')) {
          initCode.push(line);
        } else {
          preCode += `${line}\n`;
        }
      } else {
        const pattern = /^__d\s*\(.*?,\s*(-?\d+)/;
        const match = line.match(pattern);
        const moduleId = match[1];
        if (match) {
          modules.push({id: moduleId, code: line});
        }
      }
      if (last) {
        resolve({
          preCode,
          modules,
          initCode,
        });
      }
    });
  });
}

function removeBaseCode(outputPath, base) {
  return new Promise(async (resolve, reject) => {
    const outputBundle = await readBundle(outputPath);
    const baseBundle = await readBundle(base);
    const baseModuleIds = new Set(baseBundle.modules.map(mod => mod.id));
    const modId = outputBundle.initCode[1]
      .replace('__r(', '')
      .replace(');', '');
    let lastSlashIndex = outputPath.lastIndexOf('/');
    let newPath =
      outputPath.substr(0, lastSlashIndex) +
      '/' +
      `chunk-${modId}-plain.bundle`;
    let writeStream = fs.createWriteStream(newPath, {flags: 'w'});
    outputBundle.modules.forEach(value => {
      if (!baseModuleIds.has(value.id)) {
        writeStream.write(value.code + '\n');
      }
    });
    resolve();
    //commandLine '../../node_modules/hermes-engine/osx-bin/hermes', 'src/main/assets/async.js', '-emit-binary', '-out', 'src/main/assets/async.bundle'
    // const bytecodeBundlePath = newPath.replace('-plain.bundle', '.bundle');
    // exec(
    //   `node_modules/hermes-engine/osx-bin/hermes ${newPath} -emit-binary -out ${bytecodeBundlePath}`,
    //   () => {
    //     resolve();
    //   },
    // );
  });
}

function buildBaseBundle(base) {
  return runBundle({entry: 'index.js', output: base});
}

function buildBundle({entry, output, base}) {
  return runBundle({entry, output}).then(() => removeBaseCode(output, base));
}

// function generateByteCode() {
//   return new Promise((resolve, reject) => {
//     const out = BASE_BUNDLE.replace('-plain.bundle', '.bundle');
//     console.log('out', out);
//     exec(
//       `node_modules/hermes-engine/osx-bin/hermes ${BASE_BUNDLE} -emit-binary -out ${out}`,
//       {
//         cwd: __dirname,
//         maxBuffer: 10 * 1024 * 1024,
//       },
//       (err, stdout, stderr) => {
//         console.log('stdout', stdout);
//         console.log('err', err);
//         resolve();
//       },
//     );
//   });
// }

const BASE_ANDROID_BUNDLE = 'android/app/src/main/assets/index.android.bundle';
const BASE_IOS_BUNDLE = 'bundles/ios/index.ios.bundle';

const MATH_ANDROID_BUNDLE = 'android/app/src/main/assets/math.bundle';
const MATH_IOS_BUNDLE = 'bundles/ios/math.bundle';

buildBaseBundle(BASE_IOS_BUNDLE).then(() =>
  buildBundle({
    entry: 'modules/math/index.ts',
    output: MATH_IOS_BUNDLE,
    base: BASE_IOS_BUNDLE,
  }),
);
//   .then(() => generateByteCode());
