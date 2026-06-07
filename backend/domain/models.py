from django.db import models
from django.utils import timezone


class Product(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.URLField(blank=True)
    points_price = models.IntegerField(default=0)
    original_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    stock = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        app_label = 'domain'
        db_table = 'products'

    def __str__(self):
        return self.name


class FlashSaleActivity(models.Model):
    STATUS_DRAFT = 'draft'
    STATUS_PUBLISHED = 'published'
    STATUS_ONGOING = 'ongoing'
    STATUS_ENDED = 'ended'
    STATUS_CANCELLED = 'cancelled'

    STATUS_CHOICES = [
        (STATUS_DRAFT, '草稿'),
        (STATUS_PUBLISHED, '已发布'),
        (STATUS_ONGOING, '进行中'),
        (STATUS_ENDED, '已结束'),
        (STATUS_CANCELLED, '已取消'),
    ]

    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    banner = models.URLField(blank=True)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_DRAFT)
    created_by = models.CharField(max_length=100, default='admin')
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'domain'
        db_table = 'flash_sale_activities'

    def __str__(self):
        return self.name


class FlashSaleItem(models.Model):
    activity = models.ForeignKey(FlashSaleActivity, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    sale_points = models.IntegerField(default=0)
    total_stock = models.IntegerField(default=0)
    available_stock = models.IntegerField(default=0)
    sold_count = models.IntegerField(default=0)
    limit_per_user = models.IntegerField(default=1)
    sort_order = models.IntegerField(default=0)

    class Meta:
        app_label = 'domain'
        db_table = 'flash_sale_items'

    def __str__(self):
        return f'{self.activity.name} - {self.product.name}'


class UserAccount(models.Model):
    user_id = models.CharField(max_length=100, unique=True)
    user_name = models.CharField(max_length=100)
    points_balance = models.IntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        app_label = 'domain'
        db_table = 'user_accounts'

    def __str__(self):
        return f'{self.user_name} ({self.user_id})'


class FlashSaleOrder(models.Model):
    STATUS_LOCKED = 'locked'
    STATUS_PAID = 'paid'
    STATUS_CANCELLED = 'cancelled'
    STATUS_EXPIRED = 'expired'

    STATUS_CHOICES = [
        (STATUS_LOCKED, '已锁定待支付'),
        (STATUS_PAID, '已支付'),
        (STATUS_CANCELLED, '已取消'),
        (STATUS_EXPIRED, '已过期'),
    ]

    RESERVE_MINUTES = 15

    order_no = models.CharField(max_length=50, unique=True)
    activity = models.ForeignKey(FlashSaleActivity, on_delete=models.PROTECT)
    item = models.ForeignKey(FlashSaleItem, on_delete=models.PROTECT)
    product = models.ForeignKey(Product, on_delete=models.PROTECT)
    user_id = models.CharField(max_length=100)
    user_name = models.CharField(max_length=100)
    quantity = models.IntegerField(default=1)
    points_amount = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default=STATUS_LOCKED)
    locked_at = models.DateTimeField(default=timezone.now)
    paid_at = models.DateTimeField(null=True, blank=True)
    expired_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        app_label = 'domain'
        db_table = 'flash_sale_orders'
        indexes = [
            models.Index(fields=['user_id', 'activity_id']),
            models.Index(fields=['status', 'locked_at']),
        ]

    def __str__(self):
        return self.order_no
