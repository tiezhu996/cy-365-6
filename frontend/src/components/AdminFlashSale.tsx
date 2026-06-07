import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Publish as PublishIcon,
} from "@mui/icons-material";
import {
  fetchActivities,
  fetchProducts,
  createActivity,
  updateActivity,
  publishActivity,
  cancelActivity,
  initDemoData,
} from "../api/client";
import type { FlashSaleActivity, Product, FlashSaleItem } from "../types";

interface ActivityFormData {
  name: string;
  description: string;
  banner: string;
  start_time: string;
  end_time: string;
  items: Array<{
    product_id: number;
    sale_points: number;
    total_stock: number;
    limit_per_user: number;
    sort_order: number;
  }>;
}

const emptyFormData: ActivityFormData = {
  name: "",
  description: "",
  banner: "",
  start_time: "",
  end_time: "",
  items: [],
};

function getStatusColor(status: string) {
  switch (status) {
    case "draft":
      return "default";
    case "published":
      return "info";
    case "ongoing":
      return "success";
    case "ended":
      return "secondary";
    case "cancelled":
      return "error";
    default:
      return "default";
  }
}

function formatDateTimeLocal(isoString: string) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export function AdminFlashSale() {
  const [activities, setActivities] = useState<FlashSaleActivity[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<FlashSaleActivity | null>(null);
  const [formData, setFormData] = useState<ActivityFormData>(emptyFormData);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [acts, prods] = await Promise.all([
        fetchActivities(),
        fetchProducts(),
      ]);
      setActivities(acts);
      setProducts(prods);
    } catch (err) {
      console.error("加载数据失败:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleInitDemo = async () => {
    try {
      await initDemoData();
      await loadData();
      showSnackbar("演示数据初始化成功", "success");
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : "操作失败", "error");
    }
  };

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleOpenCreate = () => {
    setEditingActivity(null);
    setFormData(emptyFormData);
    setDialogOpen(true);
  };

  const handleOpenEdit = (activity: FlashSaleActivity) => {
    setEditingActivity(activity);
    setFormData({
      name: activity.name,
      description: activity.description,
      banner: activity.banner,
      start_time: formatDateTimeLocal(activity.start_time),
      end_time: formatDateTimeLocal(activity.end_time),
      items: (activity.items || []).map((item) => ({
        product_id: item.product_id,
        sale_points: item.sale_points,
        total_stock: item.total_stock,
        limit_per_user: item.limit_per_user,
        sort_order: item.sort_order,
      })),
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingActivity(null);
    setFormData(emptyFormData);
  };

  const handleFormChange = (field: keyof ActivityFormData, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddItem = () => {
    if (products.length === 0) {
      showSnackbar("请先创建商品", "error");
      return;
    }
    const defaultProduct = products[0];
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          product_id: defaultProduct.id,
          sale_points: Math.floor(defaultProduct.points_price * 0.8),
          total_stock: 10,
          limit_per_user: 1,
          sort_order: formData.items.length,
        },
      ],
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    (newItems[index] as any)[field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      showSnackbar("请输入活动名称", "error");
      return;
    }
    if (!formData.start_time || !formData.end_time) {
      showSnackbar("请设置活动时间", "error");
      return;
    }
    if (formData.items.length === 0) {
      showSnackbar("请至少添加一个商品", "error");
      return;
    }

    try {
      if (editingActivity) {
        await updateActivity(editingActivity.id, formData);
        showSnackbar("活动更新成功", "success");
      } else {
        await createActivity(formData);
        showSnackbar("活动创建成功", "success");
      }
      handleCloseDialog();
      await loadData();
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : "操作失败", "error");
    }
  };

  const handlePublish = async (activityId: number) => {
    try {
      await publishActivity(activityId);
      await loadData();
      showSnackbar("活动发布成功", "success");
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : "操作失败", "error");
    }
  };

  const handleCancel = async (activityId: number) => {
    if (!window.confirm("确定要取消该活动吗？")) return;
    try {
      await cancelActivity(activityId);
      await loadData();
      showSnackbar("活动已取消", "success");
    } catch (err) {
      showSnackbar(err instanceof Error ? err.message : "操作失败", "error");
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">秒杀活动管理</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Button variant="outlined" onClick={handleInitDemo}>
            初始化演示数据
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenCreate}>
            创建活动
          </Button>
        </Box>
      </Box>

      <Paper sx={{ p: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>活动名称</TableCell>
              <TableCell>开始时间</TableCell>
              <TableCell>结束时间</TableCell>
              <TableCell>状态</TableCell>
              <TableCell>商品数量</TableCell>
              <TableCell>创建人</TableCell>
              <TableCell>操作</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <Typography variant="body2" fontWeight={600}>
                    {activity.name}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(activity.start_time).toLocaleString("zh-CN")}
                </TableCell>
                <TableCell>
                  {new Date(activity.end_time).toLocaleString("zh-CN")}
                </TableCell>
                <TableCell>
                  <Chip
                    label={activity.status_text}
                    color={getStatusColor(activity.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>{activity.items?.length || 0}</TableCell>
                <TableCell>{activity.created_by}</TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", gap: 1 }}>
                    {activity.status === "draft" && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenEdit(activity)}
                          title="编辑"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => handlePublish(activity.id)}
                          title="发布"
                        >
                          <PublishIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                    {activity.status === "published" && (
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleCancel(activity.id)}
                        title="取消"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
            {activities.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body2" color="text.secondary" sx={{ py: 4 }}>
                    暂无活动数据，点击"初始化演示数据"或"创建活动"开始
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingActivity ? "编辑活动" : "创建活动"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="活动名称"
                value={formData.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="活动描述"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="开始时间"
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => handleFormChange("start_time", e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="结束时间"
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => handleFormChange("end_time", e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  活动商品
                </Typography>
                <Button
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={handleAddItem}
                  variant="outlined"
                >
                  添加商品
                </Button>
              </Box>
              {formData.items.map((item, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={3}>
                      <FormControl fullWidth size="small">
                        <InputLabel>商品</InputLabel>
                        <Select
                          value={item.product_id}
                          label="商品"
                          onChange={(e) => handleItemChange(index, "product_id", e.target.value)}
                        >
                          {products.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.name} (原价: {p.points_price}积分)
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="秒杀积分"
                        type="number"
                        value={item.sale_points}
                        onChange={(e) => handleItemChange(index, "sale_points", parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="总库存"
                        type="number"
                        value={item.total_stock}
                        onChange={(e) => handleItemChange(index, "total_stock", parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="每人限抢"
                        type="number"
                        value={item.limit_per_user}
                        onChange={(e) => handleItemChange(index, "limit_per_user", parseInt(e.target.value) || 1)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={2}>
                      <TextField
                        fullWidth
                        size="small"
                        label="排序"
                        type="number"
                        value={item.sort_order}
                        onChange={(e) => handleItemChange(index, "sort_order", parseInt(e.target.value) || 0)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={1}>
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Card>
              ))}
              {formData.items.length === 0 && (
                <Card sx={{ p: 3, textAlign: "center", border: "1px dashed #ccc" }}>
                  <Typography variant="body2" color="text.secondary">
                    暂无商品，点击上方"添加商品"按钮添加
                  </Typography>
                </Card>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>取消</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingActivity ? "保存修改" : "创建活动"}
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
