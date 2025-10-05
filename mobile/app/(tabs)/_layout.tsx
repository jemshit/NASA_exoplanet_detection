import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import React from 'react';

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Analysis</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore">
        <Icon sf={{ default: "chart.bar", selected: "chart.bar.fill" }} />
        <Label>Results</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
