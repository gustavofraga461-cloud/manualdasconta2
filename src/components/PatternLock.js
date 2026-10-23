import React, { useMemo, useRef, useState } from "react";
import { View, StyleSheet, PanResponder } from "react-native";
import Svg, { Circle, Line } from "react-native-svg";
import { colors } from "../theme/colors";

const SIZE = 280;
const COLS = 3;
const GAP = SIZE / 4;

function pointIndex(x, y) {
  for (let i = 0; i < 9; i += 1) {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const cx = GAP * (col + 1);
    const cy = GAP * (row + 1);
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy <= 28 * 28) return i;
  }
  return -1;
}

export default function PatternLock({ onComplete, error }) {
  const [path, setPath] = useState([]);
  const [finger, setFinger] = useState(null);
  const pathRef = useRef([]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e) => {
          pathRef.current = [];
          setPath([]);
          const { locationX, locationY } = e.nativeEvent;
          const idx = pointIndex(locationX, locationY);
          if (idx >= 0) {
            pathRef.current = [idx];
            setPath([idx]);
          }
          setFinger({ x: locationX, y: locationY });
        },
        onPanResponderMove: (e) => {
          const { locationX, locationY } = e.nativeEvent;
          const idx = pointIndex(locationX, locationY);
          if (idx >= 0 && !pathRef.current.includes(idx)) {
            pathRef.current = [...pathRef.current, idx];
            setPath(pathRef.current);
          }
          setFinger({ x: locationX, y: locationY });
        },
        onPanResponderRelease: () => {
          setFinger(null);
          if (pathRef.current.length >= 4 && onComplete) onComplete(pathRef.current);
        }
      }),
    [onComplete]
  );

  const nodes = Array.from({ length: 9 }).map((_, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return { i, x: GAP * (col + 1), y: GAP * (row + 1) };
  });

  const stroke = error ? colors.danger : colors.primary;

  return (
    <View style={styles.box} {...responder.panHandlers}>
      <Svg width={SIZE} height={SIZE}>
        {path.map((idx, n) => {
          if (n === 0) return null;
          const a = nodes[path[n - 1]];
          const b = nodes[idx];
          return <Line key={`l${n}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth="4" />;
        })}
        {finger && path.length ? (
          <Line
            x1={nodes[path[path.length - 1]].x}
            y1={nodes[path[path.length - 1]].y}
            x2={finger.x}
            y2={finger.y}
            stroke={stroke}
            strokeWidth="3"
            strokeOpacity="0.6"
          />
        ) : null}
        {nodes.map((n) => (
          <Circle
            key={n.i}
            cx={n.x}
            cy={n.y}
            r={path.includes(n.i) ? 16 : 12}
            fill={path.includes(n.i) ? stroke : "#18181B"}
            stroke={path.includes(n.i) ? "#FFFFFF" : colors.muted}
            strokeWidth="2"
          />
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { width: SIZE, height: SIZE, alignSelf: "center" }
});
