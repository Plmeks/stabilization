'use client';

import { useEffect } from "react";
import { useSetAtom, useStore } from "jotai";
import { fetchPeriodsAtom, periodsAtom } from "@/atoms/periodsAtom";
import { fetchTasksAtom } from "@/atoms/tasksAtom";
import { fetchPeriodStatisticsAtom } from "@/atoms/statsAtom";
import { initExpandedPeriodsAtom } from "@/atoms/uiAtom";

export default function DataLoader() {
  const fetchPeriods = useSetAtom(fetchPeriodsAtom);
  const fetchTasks = useSetAtom(fetchTasksAtom);
  const fetchPeriodStatistics = useSetAtom(fetchPeriodStatisticsAtom);
  const initExpanded = useSetAtom(initExpandedPeriodsAtom);
  const store = useStore();

  useEffect(() => {
    fetchTasks();
    fetchPeriodStatistics();
    fetchPeriods().then(() => {
      const periods = store.get(periodsAtom);
      initExpanded(periods);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
