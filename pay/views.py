import json
import re
from decimal import Decimal, InvalidOperation

from django.core.exceptions import ValidationError
from django.http import JsonResponse
from django.shortcuts import render
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from . import constants, xp
from .models import WalletStats

SOURCE_CHAINS = [
    "Ethereum Sepolia",
    "Base Sepolia",
    "Arbitrum Sepolia",
    "Avalanche Fuji",
    "Arc Testnet",
]

ADDRESS_RE = re.compile(r"^0x[a-fA-F0-9]{40}$")


def index(request):
    config = constants.as_config_dict()
    context = {
        "config_json": json.dumps(config),
        "source_chains": SOURCE_CHAINS,
    }
    return render(request, "pay/index.html", context)


def _stats_payload(stats: WalletStats | None, address: str) -> dict:
    if stats is None:
        info = xp.level_info(0)
        return {
            "address": address,
            "totalVolume": "0",
            "txCount": 0,
            "lastTxHash": "",
            **info,
        }
    info = xp.level_info(stats.xp)
    return {
        "address": stats.address,
        "totalVolume": str(stats.total_volume),
        "txCount": stats.tx_count,
        "lastTxHash": stats.last_tx_hash,
        **info,
    }


@require_GET
def get_activity(request, address):
    if not ADDRESS_RE.match(address):
        return JsonResponse({"error": "Invalid address."}, status=400)
    try:
        stats = WalletStats.objects.get(address__iexact=address)
    except WalletStats.DoesNotExist:
        stats = None
    return JsonResponse(_stats_payload(stats, address))


@csrf_exempt
@require_POST
def record_activity(request):
    # Honor-system endpoint: no proof of wallet ownership is checked here,
    # matching the trust model of the rest of the app (nothing else is
    # verified against the chain either). Fine for a testnet XP feature.
    try:
        body = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse({"error": "Invalid JSON body."}, status=400)

    address = str(body.get("address", ""))
    if not ADDRESS_RE.match(address):
        return JsonResponse({"error": "Invalid address."}, status=400)

    try:
        amount = Decimal(str(body.get("amount", "")))
    except (InvalidOperation, ValueError):
        return JsonResponse({"error": "Invalid amount."}, status=400)
    if amount <= 0:
        return JsonResponse({"error": "Amount must be greater than 0."}, status=400)

    kind = body.get("kind") if body.get("kind") in ("swap", "bridge") else "swap"
    tx_hash = str(body.get("txHash", ""))[:66]

    stats, _created = WalletStats.objects.get_or_create(address=address)
    stats.total_volume = stats.total_volume + amount
    stats.tx_count += 1
    stats.xp = xp.compute_xp(stats.total_volume, stats.tx_count)
    stats.last_tx_hash = tx_hash
    stats.last_tx_at = timezone.now()
    try:
        stats.full_clean()
    except ValidationError as exc:
        return JsonResponse({"error": str(exc)}, status=400)
    stats.save()

    payload = _stats_payload(stats, address)
    payload["kind"] = kind
    return JsonResponse(payload)
