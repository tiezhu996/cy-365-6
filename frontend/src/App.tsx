import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  CssBaseline,
  Paper,
  ThemeProvider,
  Typography,
  createTheme,
  Tabs,
  Tab,
} from "@mui/material";
import {
  FlashOn as FlashOnIcon,
  Dashboard as DashboardIcon,
  ShoppingBasket as ShoppingBasketIcon,
  Settings as SettingsIcon,
} from "@mui/icons-material";
import { fetchOverview } from "./api/client";
import { APP_CODE, APP_NAME, APP_THEME } from "./constants/app";
import { REQUEST_MESSAGES } from "./constants/messages";
import { createFallbackOverview } from "./state/dashboard";
import type { OverviewResponse } from "./types";
import { FeatureStrip } from "./components/FeatureStrip";
import { MetricGrid } from "./components/MetricGrid";
import { OperationsTable } from "./components/OperationsTable";
import { AdminFlashSale } from "./components/AdminFlashSale";
import { FlashSaleHall } from "./components/FlashSaleHall";
import { MyOrders } from "./components/MyOrders";

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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export default function App() {
  const [overview, setOverview] = useState<OverviewResponse>(createFallbackOverview());
  const [notice, setNotice] = useState(REQUEST_MESSAGES.overviewFallback);
  const [tabValue, setTabValue] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  const loadOverview = async () => {
    try {
      const payload = await fetchOverview();
      setOverview(payload);
      setNotice("后端服务已联通，当前展示实时接口数据。");
      setDataLoaded(true);
    } catch {
      setNotice(REQUEST_MESSAGES.overviewFallback);
    }
  };

  if (!dataLoaded) {
    loadOverview();
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main className="app-shell">
        <header className="topbar">
          <div className="brand-block">
            <span className="brand-code">{APP_CODE}</span>
            <h1 className="brand-title">{APP_NAME}</h1>
          </div>
          <Button variant="contained" href={REQUEST_MESSAGES.healthPath}>
            API Health
          </Button>
        </header>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab icon={<DashboardIcon />} label="工作台" iconPosition="start" />
            <Tab icon={<FlashOnIcon />} label="秒杀大厅" iconPosition="start" />
            <Tab icon={<ShoppingBasketIcon />} label="我的订单" iconPosition="start" />
            <Tab icon={<SettingsIcon />} label="活动管理" iconPosition="start" />
          </Tabs>
        </Paper>

        <section className="workspace">
          <TabPanel value={tabValue} index={0}>
            <div className="lead-grid">
              <Paper className="hero-panel" elevation={0}>
                <Chip label={notice} sx={{ mb: 2 }} />
                <Typography variant="h4" component="h2" gutterBottom>
                  {overview.appName}
                </Typography>
                <Typography>{overview.description}</Typography>
              </Paper>
              <MetricGrid items={overview.kpis} />
            </div>
            <FeatureStrip items={overview.features} />
            <Box className="work-panel">
              <Typography variant="h5" gutterBottom>
                运营任务流
              </Typography>
              <OperationsTable records={overview.records} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <FlashSaleHall />
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <MyOrders />
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <AdminFlashSale />
          </TabPanel>
        </section>
      </main>
    </ThemeProvider>
  );
}
