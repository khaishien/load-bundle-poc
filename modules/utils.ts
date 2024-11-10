import {NativeModules} from 'react-native';
import hasher from '../hasher';

function nextTick(sec = 1) {
  return new Promise(resolve => {
    setTimeout(resolve, sec * 1000);
  });
}

export async function lazyImport(modulePath: string) {
  console.log('##modulePath', modulePath);
  const moduleId = hasher(modulePath);
  console.log('##moduleId', moduleId);

  NativeModules.ChunkModule.loadChunk(String(moduleId));

  nextTick(10);
  console.log('##done');

  const res = global.__r(moduleId);

  return res;
}
