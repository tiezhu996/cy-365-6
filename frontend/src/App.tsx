import { useEffect, useState } from "react";
import { Box, Button, Chip, CssBaseline, Paper, ThemeProvider, Typography, createTheme } from "@mui/material";
import { fetchOverview } from "./api/client";
import { APP_CODE, APP_NAME, APP_THEME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse } from "./types";
import { FeatureStrip } from "./components/FeatureStrip";
import { MetricGrid } from "./components/MetricGrid";
import { OperationsTable } from "./components/OperationsTable";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: APP_THEME.accent },
    secondary: { main: APP_THEME.warm },
    background: { default: APP_THEME.paper, paper: APP_THEME.surface },
  },
  shape: { borderRadius: 8 },
  typography: { fontFamily: '"Avenir Next", "Gill Sans", "Segoe UI", sans-serif' },
});

export default function App() {
  const [overview, setOverview] = useState<OverviewResponse>(createFallbackOverview());
  const [notice, setNotice] = useState(REQUEST_MESSAGES.overviewFallback);

  useEffect(() => {
    fetchOverview()
      .then((payload) => {
        setOverview(payload);
        setNotice("后端服务已联通，当前展示实时接口数据。");
      })
      .catch(() => setNotice(REQUEST_MESSAGES.overviewFallback));
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main className="app-shell">
        <header className="topbar">
          <div className="brand-block">
            <span className="brand-code">{APP_CODE}</span>
            <h1 className="brand-title">{APP_NAME}</h1>
          </div>
          <Button variant="contained" href={REQUEST_MESSAGES.healthPath}>API Health</Button>
        </header>
        <section className="workspace">
          <div className="lead-grid">
            <Paper className="hero-panel" elevation={0}>
              <Chip label={notice} sx={{ mb: 2 }} />
              <Typography variant="h4" component="h2" gutterBottom>{overview.appName}</Typography>
              <Typography>{overview.description}</Typography>
            </Paper>
            <MetricGrid items={overview.kpis} />
          </div>
          <FeatureStrip items={overview.features} />
          <Box className="work-panel">
            <Typography variant="h5" gutterBottom>运营任务流</Typography>
            <OperationsTable records={overview.records} />
          </Box>
        </section>
      </main>
    </ThemeProvider>
  );
}
