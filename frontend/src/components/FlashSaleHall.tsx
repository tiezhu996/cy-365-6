import { useState, useEffect, useCallback } from "react";
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
  LinearProgress,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Timer as TimerIcon,
  LocalFireDepartment as FireIcon,
  CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { CountdownTimer } from "./CountdownTimer";
import {
  fetchActivities,
  fetchActivityDetail,
  fetchUserAccount,
  grabFlashSale,
  payOrder,
  cancelOrder,
  fetchUserOrders,
  fetchWinners,
} from "../api/client";
import type {
  FlashSaleActivity,
  FlashSaleItem,
  FlashSaleOrder,
  UserAccount,
  Winner,
} from "../types";

export function FlashSaleHall() {
  const [activities, setActivities] = useState<FlashSaleActivity[]>([]);
  const [selectedActivity, setSelectedActivity] = useState<FlashSaleActivity | null>(null);
  const [userAccount, setUserAccount] = useState<UserAccount | null>(null);
  const [userOrders, setUserOrders] = useState<FlashSaleOrder[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);
  const [grabbing, setGrabbing] = useState<number | null>(null);
  const [paying, setPaying] = useState<number | null>(null);
  const [showWinners, setShowWinners] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const [orderDialog, setOrderDialog] = useState<{ open: boolean; order: FlashSaleOrder | null }>({
    open: false,
    order: null,
  });

  const loadData = useCallback(async () => {
    try {
      const [acts, account, orders] = await Promise.all([
        fetchActivities(),
        fetchUserAccount(),
        fetchUserOrders(),
      ]);
      setActivities(acts);
      setUserAccount(account);
      setUserOrders(orders);

      const activeActivities = acts.filter((a) => a.status !== "cancelled");
      if (activeActivities.length > 0 && !selectedActivity) {
        const detail = await fetchActivityDetail(activeActivities[0].id);
        setSelectedActivity(detail);
      }
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedActivity]);

  useEffect(() => {
    loadData();
    const timer = setInterval(loadData, 10000);
    return () => clearInterval(timer);
  }, [loadData]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (selectedActivity) {
        fetchActivityDetail(selectedActivity.id).then(setSelectedActivity);
      }
    }, 5000);
    return () => clearInterval(timer);
  }, [selectedActivity]);

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleSelectActivity = async (activity: FlashSaleActivity) => {
    try {
      const detail = await fetchActivityDetail(activity.id);
      setSelectedActivity(detail);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : "加载失败", "error");
    }
  };

  const handleGrab = async (item: FlashSaleItem) => {
    if (!selectedActivity) return;
    setGrabbing(item.id);
    try {
      const order = await grabFlashSale(selectedActivity.id, item.id);
      setGrabbing(null);
      setOrderDialog({ open: true, order });
      showSnackbar("恭喜！抢购成功，请在15分钟内完成支付", "success");
      await loadData();
    } catch (err) {
      setGrabbing(null);
      showSnackbar(err instanceof Error ? err.message : "抢购失败", "error");
    }
  };

  const handlePay = async (order: FlashSaleOrder) => {
    setPaying(order.id);
    try {
      const updatedOrder = await payOrder(order.id);
      setPaying(null);
      setOrderDialog({ open: false, order: null });
      showSnackbar("支付成功！", "success");
      await loadData();
    } catch (err) {
      setPaying(null);
      showSnackbar(err instanceof Error ? err.message : "支付失败", "error");
    }
  };

  const handleCancelOrder = async (order: FlashSaleOrder) => {
    if (!window.confirm("确定要取消订单吗？")) return;
    try {
      await cancelOrder(order.id);
      setOrderDialog({ open: false, order: null });
      showSnackbar("订单已取消，库存已释放", "success");
      await loadData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : "操作失败", "error");
    }
  };

  const handleShowWinners = async () => {
    if (!selectedActivity) return;
    try {
      const data = await fetchWinners(selectedActivity.id);
      setWinners(data);
      setShowWinners(true);
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : "加载失败", "error");
    }
  };

  const getActivityLabel = (status: string) => {
    switch (status) {
      case "ongoing":
        return { text: "火热进行中", color: "error", icon: <FireIcon /> };
      case "published":
        return { text: "即将开始", color: "primary", icon: <TimerIcon /> };
      case "ended":
        return { text: "已结束", color: "default", icon: <CheckCircleIcon /> };
      case "cancelled":
        return { text: "已取消", color: "default", icon: null };
      default:
        return { text: status, color: "default", icon: null };
    }
  };

  const canGrab = (status: string) => status === "ongoing";

  const getStockPercentage = (item: FlashSaleItem) => {
    if (item.total_stock === 0) return 0;
    return ((item.total_stock - item.available_stock) / item.total_stock) * 100;
  };

  const hasUnpaidOrder = (itemId: number) => {
    return userOrders.some(
      (o) => o.item_id === itemId && o.status === "locked"
    );
  };

  const hasPaidOrder = (itemId: number) => {
    return userOrders.some(
      (o) => o.item_id === itemId && o.status === "paid"
    );
  };

  const formatTime = (iso: string) => {
    return new Date(iso).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography>加载中...</Typography>
      </Box>
    );
  }

  const visibleActivities = activities.filter((a) => a.status !== "cancelled");

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ mb: 0.5 }}>限时秒杀</Typography>
          {userAccount && (
            <Typography variant="body2" color="text.secondary">
              当前积分：<Chip
                label={`${userAccount.points_balance} 积分`}
                color="primary"
                size="small"
                variant="outlined"
              />
            </Typography>
          )}
        </Box>
        <Button variant="outlined" onClick={handleShowWinners}>
          查看成交名单
        </Button>
      </Box>

      {visibleActivities.length > 0 && (
        <Box sx={{ mb: 3, display: "flex", gap: 2, flexWrap: "wrap" }}>
          {visibleActivities.map((activity) => {
            const label = getActivityLabel(activity.status);
            return (
              <Card
                key={activity.id}
                sx={{
                  cursor: "pointer",
                  border: selectedActivity?.id === activity.id
                    ? "2px solid #6a4eb2"
                    : "1px solid transparent",
                  minWidth: 200,
                }}
                onClick={() => handleSelectActivity(activity)}
              >
                <CardContent sx={{ pb: 1 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <Chip
                      icon={label.icon || undefined}
                      label={label.text}
                      color={label.color as any}
                      size="small"
                    />
                  </Box>
                  <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>
                    {activity.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatTime(activity.start_time)} - {formatTime(activity.end_time)}
                  </Typography>
                  {activity.status === "published" && (
                    <Box sx={{ mt: 1 }}>
                      <CountdownTimer
                        targetTime={activity.start_time}
                        serverTime={activity.server_time}
                        label="距开始"
                      />
                    </Box>
                  )}
                  {activity.status === "ongoing" && (
                    <Box sx={{ mt: 1 }}>
                      <CountdownTimer
                        targetTime={activity.end_time}
                        serverTime={activity.server_time}
                        label="距结束"
                      />
                    </Box>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {selectedActivity && selectedActivity.items && (
        <Paper sx={{ p: 3 }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 1 }}>{selectedActivity.name}</Typography>
            {selectedActivity.description && (
              <Typography variant="body2" color="text.secondary">
                {selectedActivity.description}
              </Typography>
            )}
          </Box>

          <Grid container spacing={3}>
            {selectedActivity.items.map((item) => {
              const stockPct = getStockPercentage(item);
              const isSoldOut = item.available_stock <= 0;
              const alreadyGrabbed = hasPaidOrder(item.id);
              const hasUnpaid = hasUnpaidOrder(item.id);
              const disabled = !canGrab(selectedActivity.status) || isSoldOut || alreadyGrabbed;

              return (
                <Grid item xs={12} sm={6} md={4} lg={3} key={item.id}>
                  <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={item.product_image}
                      alt={item.product_name}
                      sx={{ objectFit: "cover", bgcolor: "#f5f5f5" }}
                    />
                    <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}>
                      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                        {item.product_name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                        {item.product_description}
                      </Typography>

                      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
                        <Typography variant="h5" color="error" fontWeight={700}>
                          {item.sale_points}
                        </Typography>
                        <Typography variant="body2" color="error">
                          积分
                        </Typography>
                        <Typography variant="body2" sx={{ textDecoration: "line-through", color: "text.secondary" }}>
                          原价 {item.original_points} 积分
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" color="text.secondary">
                            已抢 {item.sold_count}/{item.total_stock}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            剩余 {item.available_stock} 件
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={stockPct}
                          color="error"
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>

                      <Box sx={{ mt: "auto" }}>
                        {alreadyGrabbed && (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="success"
                            disabled
                            startIcon={<CheckCircleIcon />}
                          >
                            已抢购成功
                          </Button>
                        )}
                        {hasUnpaid && (
                          <Button
                            fullWidth
                            variant="outlined"
                            color="warning"
                            onClick={() => {
                              const order = userOrders.find(
                                (o) => o.item_id === item.id && o.status === "locked"
                              );
                              if (order) setOrderDialog({ open: true, order });
                            }}
                          >
                            待支付，去结算
                          </Button>
                        )}
                        {!alreadyGrabbed && !hasUnpaid && (
                          <Button
                            fullWidth
                            variant="contained"
                            color="error"
                            disabled={disabled || grabbing === item.id}
                            onClick={() => handleGrab(item)}
                            startIcon={<ShoppingCartIcon />}
                          >
                            {grabbing === item.id ? "抢购中..." : isSoldOut ? "已抢完" : !canGrab(selectedActivity.status) ? "活动未开始" : "立即抢购"}
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Paper>
      )}

      {visibleActivities.length === 0 && (
        <Paper sx={{ p: 8, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            暂无秒杀活动
          </Typography>
          <Typography variant="body2" color="text.secondary">
            请等待管理员发布新的秒杀活动
          </Typography>
        </Paper>
      )}

      <Dialog
        open={orderDialog.open}
        onClose={() => setOrderDialog({ open: false, order: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>订单详情</DialogTitle>
        <DialogContent dividers>
          {orderDialog.order && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" sx={{ mb: 1 }}>
                订单号：<strong>{orderDialog.order.order_no}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                商品：<strong>{orderDialog.order.product_name}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                数量：<strong>{orderDialog.order.quantity}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                应付积分：<strong style={{ color: "#d32f2f" }}>{orderDialog.order.points_amount} 积分</strong>
              </Typography>
              <Chip
                label={orderDialog.order.status_text}
                color={orderDialog.order.status === "paid" ? "success" : orderDialog.order.status === "locked" ? "warning" : "default"}
                size="small"
              />
              {orderDialog.order.status === "locked" && orderDialog.order.expires_at && (
                <Box sx={{ mt: 3, p: 2, bgcolor: "#fff8e1", borderRadius: 1 }}>
                  <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
                    库存已锁定，请在以下时间前完成支付，否则将自动释放：
                  </Typography>
                  <CountdownTimer
                    targetTime={orderDialog.order.expires_at}
                    serverTime={new Date().toISOString()}
                  />
                </Box>
              )}
              {orderDialog.order.status === "paid" && (
                <Typography variant="body2" color="success.main" sx={{ mt: 2 }}>
                  支付成功！订单已确认。
                </Typography>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {orderDialog.order?.status === "locked" && (
            <>
              <Button onClick={() => handleCancelOrder(orderDialog.order!)}>
                取消订单
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handlePay(orderDialog.order!)}
                disabled={paying === orderDialog.order?.id}
              >
                {paying === orderDialog.order?.id ? "支付中..." : "立即支付"}
              </Button>
            </>
          )}
          {orderDialog.order?.status !== "locked" && (
            <Button onClick={() => setOrderDialog({ open: false, order: null })}>
              关闭
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Dialog
        open={showWinners}
        onClose={() => setShowWinners(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>成交名单</DialogTitle>
        <DialogContent dividers>
          {winners.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              暂无成交记录
            </Typography>
          ) : (
            <Box>
              {winners.map((winner, index) => (
                <Box
                  key={winner.order_no}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.5,
                    borderBottom: index < winners.length - 1 ? "1px solid #eee" : "none",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {winner.user_name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {winner.product_name}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" color="error">
                      {winner.points_amount} 积分
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(winner.paid_at).toLocaleString("zh-CN")}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWinners(false)}>关闭</Button>
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
