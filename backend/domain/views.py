import json
from datetime import datetime
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from .services import (
    get_overview,
    list_activities,
    get_activity_detail,
    create_activity,
    update_activity,
    publish_activity,
    cancel_activity,
    list_products,
    create_product,
    get_user_account,
    grab_flash_sale,
    pay_order,
    cancel_order,
    expire_overdue_orders,
    list_user_orders,
    get_winners,
    init_demo_data,
)

CURRENT_USER_ID = 'demo_user'
CURRENT_USER_NAME = '演示用户'


def health(_request):
    return JsonResponse({"status": "ok"})


def overview(_request):
    return JsonResponse(get_overview())


@csrf_exempt
@require_http_methods(["GET"])
def api_list_activities(request):
    status_filter = request.GET.get('status')
    return JsonResponse({'data': list_activities(status_filter)})


@csrf_exempt
@require_http_methods(["GET"])
def api_get_activity(request, activity_id):
    try:
        return JsonResponse({'data': get_activity_detail(activity_id)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=404)


@csrf_exempt
@require_http_methods(["POST"])
def api_create_activity(request):
    try:
        data = json.loads(request.body)
        data['start_time'] = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        data['end_time'] = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        return JsonResponse({'data': create_activity(data)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["PUT"])
def api_update_activity(request, activity_id):
    try:
        data = json.loads(request.body)
        if 'start_time' in data:
            data['start_time'] = datetime.fromisoformat(data['start_time'].replace('Z', '+00:00'))
        if 'end_time' in data:
            data['end_time'] = datetime.fromisoformat(data['end_time'].replace('Z', '+00:00'))
        return JsonResponse({'data': update_activity(activity_id, data)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_publish_activity(request, activity_id):
    try:
        return JsonResponse({'data': publish_activity(activity_id)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["POST"])
def api_cancel_activity(request, activity_id):
    try:
        return JsonResponse({'data': cancel_activity(activity_id)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET"])
def api_list_products(request):
    return JsonResponse({'data': list_products()})


@csrf_exempt
@require_http_methods(["POST"])
def api_create_product(request):
    try:
        data = json.loads(request.body)
        return JsonResponse({'data': create_product(data)})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)


@csrf_exempt
@require_http_methods(["GET"])
def api_get_user_account(request):
    return JsonResponse({'data': get_user_account(CURRENT_USER_ID)})


@csrf_exempt
@require_http_methods(["POST"])
def api_grab_flash_sale(request, activity_id, item_id):
    try:
        return JsonResponse({'data': grab_flash_sale(activity_id, item_id, CURRENT_USER_ID, CURRENT_USER_NAME)})
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_pay_order(request, order_id):
    try:
        return JsonResponse({'data': pay_order(order_id, CURRENT_USER_ID)})
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_cancel_order(request, order_id):
    try:
        return JsonResponse({'data': cancel_order(order_id, CURRENT_USER_ID)})
    except ValueError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def api_expire_overdue_orders(request):
    try:
        return JsonResponse({'data': expire_overdue_orders()})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["GET"])
def api_list_user_orders(request):
    return JsonResponse({'data': list_user_orders(CURRENT_USER_ID)})


@csrf_exempt
@require_http_methods(["GET"])
def api_get_winners(request, activity_id):
    return JsonResponse({'data': get_winners(activity_id)})


@csrf_exempt
@require_http_methods(["POST"])
def api_init_demo_data(request):
    try:
        return JsonResponse({'data': init_demo_data()})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
