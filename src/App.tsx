import { YMaps, Map, ObjectManager } from '@pbe/react-yandex-maps';
import './App.css';
import { useEffect, useState } from 'react';

import { Button, Typography, Upload, UploadFile, UploadProps, message } from 'antd';

import resultYaMap from './resultYaMap.json';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/es/upload';

// let points: number[][] = resultYaMap as number[][];
let points: number[][] = [[1, 1]];

const props: UploadProps = {};

const createChunks = (file: any, cSize: any /* cSize should be byte 1024*1 = 1KB */) => {
  let startPointer = 0;
  let endPointer = file.size;
  let chunks = [];
  while (startPointer < endPointer) {
    let newStartPointer = startPointer + cSize;
    chunks.push(file.slice(startPointer, newStartPointer));
    startPointer = newStartPointer;
  }
  return chunks;
};

function App() {
  const [clusterPoints, setClusterPoints] = useState([{}]);

  const handlerOnChange = (info: UploadChangeParam<UploadFile<unknown>>) => {
    if (info.file.status === 'done') {
      void message.success(`${info.file.name} Загрузка успешна`);
    } else if (info.file.status === 'error') {
      void message.error(`${info.file.name} Файл не загружен :(`);
    }
  };

  useEffect(() => {
    if (points.length) {
      const tempArr = points.map((item, index) => ({
        type: 'Feature',
        id: index,
        geometry: { type: 'Point', coordinates: item },
        properties: {
          // hintContent: '2 машины',
        },
      }));
      setClusterPoints(tempArr);
    }
  }, []);

  return (
    <>
      <div
        style={{
          width: '300px',
          display: 'inline-flex',
          flexDirection: 'column',
          justifyContent: 'center',
          justifySelf: 'center',
          marginBottom: '20px',
        }}
      >
        <Typography.Title level={2}>Отчет</Typography.Title>
        <Upload
          accept={'.json'}
          name={'file'}
          onChange={handlerOnChange}
          action={async (file) => {
            console.log(file);
            createChunks(file, 1024).map((chunk) => {
              console.log(chunk);
              console.log(String.fromCharCode.apply(null, [...new Uint8Array(chunk)]));
              points = JSON.parse(String.fromCharCode.apply(null, [...new Uint8Array(chunk)]));
              if (points.length) {
                const tempArr = points.map((item, index) => ({
                  type: 'Feature',
                  id: index,
                  geometry: { type: 'Point', coordinates: item },
                  properties: {
                    // hintContent: '2 машины',
                  },
                }));
                setClusterPoints((old) => [...old, tempArr]);
              }
            });
            points = [[]];
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment

            return new Promise(() => null);
          }}
          {...props}
        >
          <Button icon={<UploadOutlined />}>Загрузить файл</Button>
        </Upload>
      </div>
      <YMaps>
        <Map defaultState={{ center: [55.75, 37.57], zoom: 9 }} width={'1620px'} height={'680px'}>
          <ObjectManager
            options={{
              clusterize: true,
              gridSize: 32,
            }}
            objects={{
              openBalloonOnClick: true,
              preset: 'islands#redDotIcon',
            }}
            clusters={{
              preset: 'islands#violetClusterIcons',
            }}
            // filter={(object: { id: number }) => object.id % 2 === 0}
            features={clusterPoints}
            defaultFeatures={points}
            modules={['objectManager.addon.objectsBalloon', 'objectManager.addon.objectsHint']}
          />
        </Map>
      </YMaps>
    </>
  );
}

export default App;
