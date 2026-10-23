import React from 'react';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { C } from '../theme';

export default function Logo({ size = 56 }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Rect x="8" y="8" width="84" height="84" rx="24" fill={C.red} />
      <Rect x="27" y="19" width="46" height="62" rx="7" fill={C.white} />
      <Path d="M38 36 l5 5 9 -10 M38 52 l5 5 9 -10" stroke={C.red} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <Path d="M57 36 h7 M57 52 h7" stroke={C.surface} strokeWidth="4" strokeLinecap="round"/>
      <Circle cx="66" cy="68" r="15" fill={C.surface}/>
      <Path d="M58 68 l6 6 11 -13" stroke={C.red2} strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </Svg>
  );
}
