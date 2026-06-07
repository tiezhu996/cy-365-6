import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Grid,
  Paper,
  Typography,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { CountdownTimer } from "./CountdownTimer";
import {
  fetchUserOrders,
  fetchUserAccount,
  payOrder,
  cancelOrder,
} from "../api/client";
import type { FlashSaleOrder, UserAccount } from "../types";

function getStatusColor(status: string) {
  switch (status) {
    case "locked":
      return "warning";
    case "paid":
      return "success";
    case "cancelled":
      return "default";
    case "expired":
      return "error";
    default:
      return "default";
  }
}

export function MyOrders() {
  const [orders, setOrders] = useState<FlashSaleOrder[]>([]);
  const [account, setAccount] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState<number | null>(null);
  const [payDialog, setPayDialog] = useState<{ open: boolean; order: FlashSaleOrder | null }>({
    open: false,
    order: null,
  });
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const loadData = async () => {
    try {
      const [ordersData, accountData] = await Promise.all([
        fetchUserOrders(),
        fetchUserAccount(),
      ]);
      setOrders(ordersData);
      setAccount(accountData);
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 15000);
    return () => clearInterval(timer);
  }, []);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handlePay = async (order: FlashSaleOrder) => {
    setPaying(order.id);
    try {
      await payOrder(order.id);
      setPaying(null);
      setPayDialog({ open: false, order: null });
      showSnackbar("支付成功！", "success");
      await loadData();
    } catch (err) {
      setPaying(null);
      showSnackbar(err instanceof Error ? err.message : "支付失败", "error");
    }
  };

  const handleCancel = async (order: FlashSaleOrder) => {
    if (!window.confirm("确定要取消订单吗？")) return;
    try {
      await cancelOrder(order.id);
      showSnackbar("订单已取消，库存已释放", "success");
      await loadData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : "操作失败", "error");
    }
  };

  const groupedOrders = orders.reduce((acc, order) => {
    const status = order.status;
    if (!acc[status]) acc[status] = [];
    acc[status].push(order);
    return acc;
  }, {} as Record<string, FlashSaleOrder[]>);

  const statusOrder = ["locked", "paid", "cancelled", "expired"];
  const statusLabels: Record<string, string> = {
    locked: "待支付",
    paid: "已支付",
    cancelled: "已取消",
    expired: "已过期",
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5">我的订单</Typography>
          {account && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              当前积分：<Chip
                label={`${account.points_balance} 积分`}
                color="primary"
                size="small"
                variant="outlined"
              />
            </Typography>
          )}
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadData}
        >
          刷新
        </Button>
      </Box>

      {orders.length === 0 ? (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            暂无订单记录
          </Typography>
          <Typography variant="body2" color="text.secondary">
            去秒杀大厅看看有没有心仪的商品吧
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {statusOrder.map((status) => {
            const statusOrders = groupedOrders[status] || [];
            if (statusOrders.length === 0) return null;

            return (
              <Grid item xs={12} key={status}>
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                    <Typography variant="h6">
                      {statusLabels[status]}
                    </Typography>
                    <Chip
                      label={statusOrders.length}
                      size="small"
                      color={getStatusColor(status) as any}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    {statusOrders.map((order) => (
                      <Grid item xs={12} sm={6} md={4} key={order.id}>
                        <Card sx={{ height: "100%" }}>
                          <Box sx={{ display: "flex", height: "100%" }}>
                            <CardMedia
                              component="img"
                              sx={{ width: 120, objectFit: "cover" }}
                              image={order.product_image}
                              alt={order.product_name}
                            />
                            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                                {order.product_name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                                {order.activity_name}
                              </Typography>
                              <Typography variant="body2" sx={{ mb: 1 }}>
                                订单号：{order.order_no}
                              </Typography>
                              <Typography variant="h6" color="error" sx={{ mb: 1 }}>
                                {order.points_amount} 积分
                              </Typography>
                              <Box sx={{ mt: "auto" }}>
                                <Chip
                                  label={order.status_text}
                                  size="small"
                                  color={getStatusColor(order.status) as any}
                                  sx={{ mb: 1 }}
                                />

                                {order.status === "locked" && order.expires_at && (
                                  <Box>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                                      <WarningIcon fontSize="small" color="warning" />
                                      <Typography variant="caption" color="warning.main">
                                        支付倒计时
                                      </Typography>
                                    </Box>
                                    <CountdownTimer
                                      targetTime={order.expires_at}
                                      serverTime={new Date().toISOString()}
                                    />
                                  </Box>
                                )}

                                {order.status === "paid" && order.paid_at && (
                                  <Typography variant="caption" color="text.secondary">
                                    支付时间：{new Date(order.paid_at).toLocaleString("zh-CN")}
                                  </Typography>
                                )}

                                {order.status === "expired" && order.expired_at && (
                                  <Typography variant="caption" color="error">
                                    过期时间：{new Date(order.expired_at).toLocaleString("zh-CN")}
                                  </Typography>
                                )}

                                {order.status === "cancelled" && order.cancelled_at && (
                                  <Typography variant="caption" color="text.secondary">
                                    取消时间：{new Date(order.cancelled_at).toLocaleString("zh-CN")}
                                  </Typography>
                                )}

                                {order.status === "locked" && (
                                  <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                                    <Button
                                      size="small"
                                      onClick={() => handleCancel(order)}
                                    >
                                      取消
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="error"
                                      onClick={() => setPayDialog({ open: true, order })}
                                      disabled={paying === order.id}
                                    >
                                      {paying === order.id ? "支付中..." : "去支付"}
                                    </Button>
                                  </Box>
                                )}
                              </Box>
                            </CardContent>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      )}

      <Dialog
        open={payDialog.open}
        onClose={() => setPayDialog({ open: false, order: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>确认支付</DialogTitle>
        <DialogContent dividers>
          {payDialog.order && (
            <Box sx={{ pt: 1 }}>
              <List dense>
                <ListItem>
                  <ListItemText
                    primary="商品"
                    secondary={payDialog.order.product_name}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="数量"
                    secondary={payDialog.order.quantity}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="应付积分"
                    secondary={
                      <Typography color="error" fontWeight={600}>
                        {payDialog.order.points_amount} 积分
                      </Typography>
                    }
                  />
                </ListItem>
                <ListItem>
                  <ListItemText
                    primary="当前积分余额"
                    secondary={
                      <Typography>
                        {account?.points_balance || 0} 积分
                      </Typography>
                    }
                  />
                </ListItem>
              </List>
              {account && account.points_balance < payDialog.order.points_amount && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  积分不足，无法完成支付
                </Alert>
              )}
              {payDialog.order.expires_at && (
                <Box sx={{ mt: 2, p: 2, bgcolor: "#fff8e1", borderRadius: 1 }}>
                  <CountdownTimer
                    targetTime={payDialog.order.expires_at}
                    serverTime={new Date().toISOString()}
                    label="请在"
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPayDialog({ open: false, order: null })}>
            取消
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => payDialog.order && handlePay(payDialog.order)}
            disabled={paying === payDialog.order?.id || !account || account.points_balance < (payDialog.order?.points_amount || 0)}
          >
            {paying === payDialog.order?.id ? "支付中..." : "确认支付"}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
