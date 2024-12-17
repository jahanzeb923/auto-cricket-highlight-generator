// src/CricketBall.js
import React from 'react';
import Svg, { Circle, Line } from 'react-native-svg';

const CricketBall = ({ size = 100, color = '#D32F2F' }) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Circle cx="50" cy="50" r="50" fill={color} />
    <Line x1="10" y1="50" x2="90" y2="50" stroke="#ffffff" strokeWidth="5" />
    <Line x1="15" y1="40" x2="85" y2="40" stroke="#ffffff" strokeWidth="3" />
    <Line x1="15" y1="60" x2="85" y2="60" stroke="#ffffff" strokeWidth="3" />
  </Svg>
);

export default CricketBall;
