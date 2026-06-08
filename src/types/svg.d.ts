// SVG files are imported as React components via react-native-svg-transformer
// (see metro.config.js). This ambient declaration gives those imports types.
declare module '*.svg' {
  import type { FC } from 'react';
  import type { SvgProps } from 'react-native-svg';

  const content: FC<SvgProps>;
  export default content;
}
