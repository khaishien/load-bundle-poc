import React from 'react';
import {Button, SafeAreaView, Text, View} from 'react-native';
import {lazyImport} from './modules/utils';
import {MyMath} from './types/MyMath';

function App(): React.JSX.Element {
  const [math, setMathMod] = React.useState<MyMath | null>(null);
  React.useEffect(() => {
    lazyImport('modules/math/index.ts').then(module => {
      setMathMod(() => module);
    });
  }, []);

  const multiply = () => {
    console.log('math', math);
    if (math) {
      const res = math.multiply(1, 2);
      console.log('res', res);
    }
  };

  return (
    <SafeAreaView>
      <View>
        <Text>HALO THIS IS APP</Text>
        <Button title="mulitply" onPress={multiply} />
        {math && <math.MathView />}
      </View>
    </SafeAreaView>
  );
}

export default App;
