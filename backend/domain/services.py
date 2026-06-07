import uuid
from datetime import timedelta
from django.utils import timezone
from django.db import transaction
from .models import (
    Product,
    FlashSaleActivity,
    FlashSaleItem,
    UserAccount,
    FlashSaleOrder,
)

OVERVIEW = {
  "appName": "企业福利积分商城系统",
  "appCode": "ldwelfaremall",
  "description": "面向企业HR部门，提供员工福利积分发放、积分商城兑换和福利账单管理的一站式平台。",
  "features": [
    {
      "id": 1,
      "title": "积分发放规则配置",
      "description": "HR配置积分获取规则，如考勤全勤、绩效优秀、入职周年、节日福利等，系统自动计算并发放积分到员工账户。",
      "status": "已上线",
      "metric": "88%"
    },
    {
      "id": 2,
      "title": "积分商城商品上架",
      "description": "管理员上架可兑换商品（实物/虚拟卡券/服务），设置所需积分、库存数量和兑换限制（如每人限兑数量）。",
      "status": "排期中",
      "metric": "31 单"
    },
    {
      "id": 3,
      "title": "秒杀与限时兑换",
      "description": "设置限时秒杀活动，指定活动时段和库存，员工在活动期间抢购，先到先得，增强福利趣味性。",
      "status": "巡检中",
      "metric": "10 项"
    },
    {
      "id": 4,
      "title": "积分抽奖转盘",
      "description": "员工消耗积分参与抽奖，配置奖项概率和奖品池（积分/实物/虚拟卡券/服务），记录每次抽奖结果和中奖名单。",
      "status": "优化中",
      "metric": "4 级"
    },
    {
      "id": 5,
      "title": "订单发货与福利账单",
      "description": "兑换成功后生成订单，管理员处理发货并更新物流状态，HR可查看月度福利积分支出账单和兑换统计。",
      "status": "可导出",
      "metric": "28 条"
    }
  ],
  "kpis": [
    {
      "label": "今日处理",
      "value": "104",
      "trend": "+12%",
      "tone": "primary"
    },
    {
      "label": "预约/订单",
      "value": "40",
      "trend": "+8%",
      "tone": "warm"
    },
    {
      "label": "履约率",
      "value": "92%",
      "trend": "+3%",
      "tone": "cool"
    },
    {
      "label": "待处理",
      "value": "9",
      "trend": "需跟进",
      "tone": "neutral"
    }
  ],
  "records": [
    {
      "key": "ldwelfaremall-1",
      "name": "积分发放规则配置",
      "owner": "运营组",
      "status": "已上线",
      "metric": "88%",
      "priority": "高"
    },
    {
      "key": "ldwelfaremall-2",
      "name": "积分商城商品上架",
      "owner": "管理员",
      "status": "排期中",
      "metric": "31 单",
      "priority": "中"
    },
    {
      "key": "ldwelfaremall-3",
      "name": "秒杀与限时兑换",
      "owner": "服务台",
      "status": "巡检中",
      "metric": "10 项",
      "priority": "低"
    },
    {
      "key": "ldwelfaremall-4",
      "name": "积分抽奖转盘",
      "owner": "财务组",
      "status": "优化中",
      "metric": "4 级",
      "priority": "高"
    },
    {
      "key": "ldwelfaremall-5",
      "name": "订单发货与福利账单",
      "owner": "审核组",
      "status": "可导出",
      "metric": "28 条",
      "priority": "中"
    }
  ]
}


def get_overview():
    return OVERVIEW


def _get_activity_status(activity):
    now = timezone.now()
    if activity.status == FlashSaleActivity.STATUS_CANCELLED:
        return FlashSaleActivity.STATUS_CANCELLED
    if now < activity.start_time:
        return FlashSaleActivity.STATUS_PUBLISHED if activity.status == FlashSaleActivity.STATUS_PUBLISHED else activity.status
    if activity.start_time <= now <= activity.end_time:
        return FlashSaleActivity.STATUS_ONGOING
    if now > activity.end_time:
        return FlashSaleActivity.STATUS_ENDED
    return activity.status


def _serialize_activity(activity, include_items=False):
    status = _get_activity_status(activity)
    data = {
        'id': activity.id,
        'name': activity.name,
        'description': activity.description,
        'banner': activity.banner,
        'start_time': activity.start_time.isoformat(),
        'end_time': activity.end_time.isoformat(),
        'status': status,
        'status_text': dict(FlashSaleActivity.STATUS_CHOICES).get(status, status),
        'created_by': activity.created_by,
        'created_at': activity.created_at.isoformat(),
        'server_time': timezone.now().isoformat(),
    }
    if include_items:
        data['items'] = [_serialize_item(item) for item in activity.items.all().order_by('sort_order', 'id')]
    return data


def _serialize_item(item):
    return {
        'id': item.id,
        'product_id': item.product.id,
        'product_name': item.product.name,
        'product_image': item.product.image,
        'product_description': item.product.description,
        'sale_points': item.sale_points,
        'original_points': item.product.points_price,
        'total_stock': item.total_stock,
        'available_stock': item.available_stock,
        'sold_count': item.sold_count,
        'limit_per_user': item.limit_per_user,
        'sort_order': item.sort_order,
    }


def _serialize_order(order):
    return {
        'id': order.id,
        'order_no': order.order_no,
        'activity_id': order.activity.id,
        'activity_name': order.activity.name,
        'item_id': order.item.id,
        'product_id': order.product.id,
        'product_name': order.product.name,
        'product_image': order.product.image,
        'user_id': order.user_id,
        'user_name': order.user_name,
        'quantity': order.quantity,
        'points_amount': order.points_amount,
        'status': order.status,
        'status_text': dict(FlashSaleOrder.STATUS_CHOICES).get(order.status, order.status),
        'locked_at': order.locked_at.isoformat() if order.locked_at else None,
        'paid_at': order.paid_at.isoformat() if order.paid_at else None,
        'expired_at': order.expired_at.isoformat() if order.expired_at else None,
        'cancelled_at': order.cancelled_at.isoformat() if order.cancelled_at else None,
        'expires_at': (order.locked_at + timedelta(minutes=FlashSaleOrder.RESERVE_MINUTES)).isoformat() if order.status == FlashSaleOrder.STATUS_LOCKED else None,
        'created_at': order.created_at.isoformat(),
    }


def get_current_user(user_id='demo_user', user_name='演示用户'):
    account, created = UserAccount.objects.get_or_create(
        user_id=user_id,
        defaults={'user_name': user_name, 'points_balance': 5000}
    )
    return account


def list_activities(status_filter=None):
    activities = FlashSaleActivity.objects.all().order_by('-start_time')
    if status_filter:
        activities = activities.filter(status=status_filter)
    return [_serialize_activity(act) for act in activities]


def get_activity_detail(activity_id):
    activity = FlashSaleActivity.objects.prefetch_related('items', 'items__product').get(id=activity_id)
    return _serialize_activity(activity, include_items=True)


def create_activity(data):
    with transaction.atomic():
        activity = FlashSaleActivity.objects.create(
            name=data['name'],
            description=data.get('description', ''),
            banner=data.get('banner', ''),
            start_time=data['start_time'],
            end_time=data['end_time'],
            status=FlashSaleActivity.STATUS_DRAFT,
            created_by=data.get('created_by', 'admin'),
        )
        for item_data in data.get('items', []):
            product = Product.objects.get(id=item_data['product_id'])
            FlashSaleItem.objects.create(
                activity=activity,
                product=product,
                sale_points=item_data['sale_points'],
                total_stock=item_data['total_stock'],
                available_stock=item_data['total_stock'],
                limit_per_user=item_data.get('limit_per_user', 1),
                sort_order=item_data.get('sort_order', 0),
            )
        return _serialize_activity(activity, include_items=True)


def update_activity(activity_id, data):
    with transaction.atomic():
        activity = FlashSaleActivity.objects.get(id=activity_id)
        if activity.status not in [FlashSaleActivity.STATUS_DRAFT, FlashSaleActivity.STATUS_PUBLISHED]:
            raise ValueError('活动已开始或已结束，无法修改')
        activity.name = data.get('name', activity.name)
        activity.description = data.get('description', activity.description)
        activity.banner = data.get('banner', activity.banner)
        if 'start_time' in data:
            activity.start_time = data['start_time']
        if 'end_time' in data:
            activity.end_time = data['end_time']
        activity.save()

        if 'items' in data:
            activity.items.all().delete()
            for item_data in data['items']:
                product = Product.objects.get(id=item_data['product_id'])
                FlashSaleItem.objects.create(
                    activity=activity,
                    product=product,
                    sale_points=item_data['sale_points'],
                    total_stock=item_data['total_stock'],
                    available_stock=item_data['total_stock'],
                    limit_per_user=item_data.get('limit_per_user', 1),
                    sort_order=item_data.get('sort_order', 0),
                )
        return _serialize_activity(activity, include_items=True)


def publish_activity(activity_id):
    activity = FlashSaleActivity.objects.get(id=activity_id)
    if activity.status != FlashSaleActivity.STATUS_DRAFT:
        raise ValueError('只有草稿状态的活动可以发布')
    if activity.items.count() == 0:
        raise ValueError('请先添加活动商品')
    activity.status = FlashSaleActivity.STATUS_PUBLISHED
    activity.save()
    return _serialize_activity(activity)


def cancel_activity(activity_id):
    activity = FlashSaleActivity.objects.get(id=activity_id)
    if activity.status in [FlashSaleActivity.STATUS_ENDED, FlashSaleActivity.STATUS_CANCELLED]:
        raise ValueError('活动已结束或已取消')
    activity.status = FlashSaleActivity.STATUS_CANCELLED
    activity.save()
    return _serialize_activity(activity)


def list_products():
    products = Product.objects.filter(is_active=True).order_by('-id')
    return [{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'image': p.image,
        'points_price': p.points_price,
        'original_price': str(p.original_price),
        'stock': p.stock,
    } for p in products]


def create_product(data):
    product = Product.objects.create(
        name=data['name'],
        description=data.get('description', ''),
        image=data.get('image', ''),
        points_price=data['points_price'],
        original_price=data.get('original_price', 0),
        stock=data.get('stock', 0),
    )
    return {
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'image': product.image,
        'points_price': product.points_price,
        'original_price': str(product.original_price),
        'stock': product.stock,
    }


def get_user_account(user_id):
    account = get_current_user(user_id)
    return {
        'user_id': account.user_id,
        'user_name': account.user_name,
        'points_balance': account.points_balance,
    }


def grab_flash_sale(activity_id, item_id, user_id, user_name):
    with transaction.atomic():
        activity = FlashSaleActivity.objects.select_for_update().get(id=activity_id)
        now = timezone.now()

        current_status = _get_activity_status(activity)
        if current_status != FlashSaleActivity.STATUS_ONGOING:
            if current_status == FlashSaleActivity.STATUS_PUBLISHED:
                raise ValueError('活动尚未开始')
            elif current_status == FlashSaleActivity.STATUS_ENDED:
                raise ValueError('活动已结束')
            elif current_status == FlashSaleActivity.STATUS_CANCELLED:
                raise ValueError('活动已取消')
            else:
                raise ValueError('活动未开始')

        item = FlashSaleItem.objects.select_for_update().get(id=item_id, activity_id=activity_id)

        if item.available_stock <= 0:
            raise ValueError('商品已抢完')

        existing_count = FlashSaleOrder.objects.filter(
            user_id=user_id,
            activity_id=activity_id,
            item_id=item_id,
            status__in=[FlashSaleOrder.STATUS_LOCKED, FlashSaleOrder.STATUS_PAID]
        ).count()
        if existing_count >= item.limit_per_user:
            raise ValueError(f'每人限抢{item.limit_per_user}件')

        account = UserAccount.objects.select_for_update().get(user_id=user_id)
        if account.points_balance < item.sale_points:
            raise ValueError('积分不足')

        item.available_stock -= 1
        item.sold_count += 1
        item.save()

        order_no = f'FS{timezone.now().strftime("%Y%m%d%H%M%S")}{uuid.uuid4().hex[:6].upper()}'
        order = FlashSaleOrder.objects.create(
            order_no=order_no,
            activity=activity,
            item=item,
            product=item.product,
            user_id=user_id,
            user_name=user_name,
            quantity=1,
            points_amount=item.sale_points,
            status=FlashSaleOrder.STATUS_LOCKED,
            locked_at=now,
        )

        return _serialize_order(order)


def pay_order(order_id, user_id):
    with transaction.atomic():
        order = FlashSaleOrder.objects.select_for_update().get(id=order_id, user_id=user_id)

        if order.status != FlashSaleOrder.STATUS_LOCKED:
            raise ValueError('订单状态不正确，无法支付')

        expire_time = order.locked_at + timedelta(minutes=FlashSaleOrder.RESERVE_MINUTES)
        if timezone.now() > expire_time:
            order.status = FlashSaleOrder.STATUS_EXPIRED
            order.expired_at = timezone.now()
            order.item.available_stock += 1
            order.item.sold_count -= 1
            order.item.save()
            order.save()
            raise ValueError('订单已超时，库存已释放')

        account = UserAccount.objects.select_for_update().get(user_id=user_id)
        if account.points_balance < order.points_amount:
            raise ValueError('积分不足')

        account.points_balance -= order.points_amount
        account.save()

        order.status = FlashSaleOrder.STATUS_PAID
        order.paid_at = timezone.now()
        order.save()

        return _serialize_order(order)


def cancel_order(order_id, user_id):
    with transaction.atomic():
        order = FlashSaleOrder.objects.select_for_update().get(id=order_id, user_id=user_id)

        if order.status != FlashSaleOrder.STATUS_LOCKED:
            raise ValueError('只有锁定状态的订单可以取消')

        order.status = FlashSaleOrder.STATUS_CANCELLED
        order.cancelled_at = timezone.now()
        order.item.available_stock += 1
        order.item.sold_count -= 1
        order.item.save()
        order.save()

        return _serialize_order(order)


def expire_overdue_orders():
    now = timezone.now()
    expire_cutoff = now - timedelta(minutes=FlashSaleOrder.RESERVE_MINUTES)

    with transaction.atomic():
        expired_orders = FlashSaleOrder.objects.select_for_update().filter(
            status=FlashSaleOrder.STATUS_LOCKED,
            locked_at__lte=expire_cutoff
        )

        count = 0
        for order in expired_orders:
            order.status = FlashSaleOrder.STATUS_EXPIRED
            order.expired_at = now
            order.item.available_stock += 1
            order.item.sold_count -= 1
            order.item.save()
            order.save()
            count += 1

    return {'expired_count': count}


def list_user_orders(user_id):
    orders = FlashSaleOrder.objects.filter(user_id=user_id).order_by('-created_at')
    return [_serialize_order(order) for order in orders]


def get_winners(activity_id):
    orders = FlashSaleOrder.objects.filter(
        activity_id=activity_id,
        status=FlashSaleOrder.STATUS_PAID
    ).order_by('paid_at')
    return [{
        'user_name': o.user_name,
        'product_name': o.product.name,
        'points_amount': o.points_amount,
        'paid_at': o.paid_at.isoformat() if o.paid_at else None,
        'order_no': o.order_no,
    } for o in orders]


def init_demo_data():
    products = [
        {'name': '小米手环8', 'description': '智能运动手环，心率监测', 'points_price': 300, 'original_price': 249, 'stock': 100},
        {'name': '罗技MX Master 3S', 'description': '无线蓝牙办公鼠标', 'points_price': 800, 'original_price': 699, 'stock': 50},
        {'name': 'Kindle Paperwhite', 'description': '电子书阅读器 6.8英寸', 'points_price': 1200, 'original_price': 1099, 'stock': 30},
        {'name': 'AirPods Pro 2', 'description': '苹果无线降噪耳机', 'points_price': 1800, 'original_price': 1699, 'stock': 20},
        {'name': 'Switch OLED', 'description': '任天堂游戏机', 'points_price': 2500, 'original_price': 2299, 'stock': 10},
        {'name': '戴森吹风机HD08', 'description': '负离子护发吹风机', 'points_price': 3000, 'original_price': 2799, 'stock': 5},
    ]

    for p in products:
        p['image'] = "https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=" + p['name'].replace(' ', '%20') + "%20product%20photo&image_size=square"
        if not Product.objects.filter(name=p['name']).exists():
            Product.objects.create(**p)

    get_current_user('demo_user', '演示用户')
    get_current_user('user001', '张三')
    get_current_user('user002', '李四')
    get_current_user('user003', '王五')

    return {'message': '演示数据初始化完成'}
