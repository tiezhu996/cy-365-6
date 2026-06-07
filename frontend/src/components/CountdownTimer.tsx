import { useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";

interface CountdownTimerProps {
  targetTime: string;
  serverTime: string;
  label?: string;
  onExpire?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

function calculateTimeLeft(
  targetIso: string,
  serverIso: string
): TimeLeft {
  const now = new Date().getTime();
  const serverNow = new Date(serverIso).getTime();
  const target = new Date(targetIso).getTime();
  const diff = target - (now - serverNow + new Date(serverIso).getTime());

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, expired: false };
}

export function CountdownTimer({
  targetTime,
  serverTime,
  label,
  onExpire,
}: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() =>
    calculateTimeLeft(targetTime, serverTime)
  );

  useEffect(() => {
    setTimeLeft(calculateTimeLeft(targetTime, serverTime));

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetTime, serverTime);
      setTimeLeft(newTimeLeft);
      if (newTimeLeft.expired && onExpire) {
        onExpire();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetTime, serverTime, onExpire]);

  if (timeLeft.expired) {
    return (
      <Chip
        label={label || "已结束"}
        color="default"
        variant="outlined"
        size="small"
      />
    );
  }

  const timeParts = [];
  if (timeLeft.days > 0) {
    timeParts.push(
      <Box key="days" sx={timeBlockStyle}>
        <Typography variant="h6" sx={timeNumberStyle}>
          {timeLeft.days.toString().padStart(2, "0")}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          天
        </Typography>
      </Box>
    );
  }
  timeParts.push(
    <Box key="hours" sx={timeBlockStyle}>
      <Typography variant="h6" sx={timeNumberStyle}>
        {timeLeft.hours.toString().padStart(2, "0")}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        时
      </Typography>
    </Box>,
    <Box key="sep1" sx={separatorStyle}>
      <Typography variant="h6" sx={timeNumberStyle}>
        :
      </Typography>
    </Box>,
    <Box key="minutes" sx={timeBlockStyle}>
      <Typography variant="h6" sx={timeNumberStyle}>
        {timeLeft.minutes.toString().padStart(2, "0")}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        分
      </Typography>
    </Box>,
    <Box key="sep2" sx={separatorStyle}>
      <Typography variant="h6" sx={timeNumberStyle}>
        :
      </Typography>
    </Box>,
    <Box key="seconds" sx={timeBlockStyle}>
      <Typography variant="h6" sx={timeNumberStyle}>
        {timeLeft.seconds.toString().padStart(2, "0")}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        秒
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
      {label && (
        <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
          {label}
        </Typography>
      )}
      {timeParts}
    </Box>
  );
}

const timeBlockStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  minWidth: "36px",
  bgcolor: "rgba(106, 78, 178, 0.1)",
  borderRadius: "6px",
  px: 1,
  py: 0.5,
};

const timeNumberStyle = {
  fontFamily: '"SF Mono", "Menlo", monospace',
  fontWeight: 700,
  color: "#6a4eb2",
  lineHeight: 1.2,
};

const separatorStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  px: 0.25,
};
