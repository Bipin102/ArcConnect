import json

from django.shortcuts import render

from . import constants

SOURCE_CHAINS = [
    "Ethereum Sepolia",
    "Base Sepolia",
    "Arbitrum Sepolia",
    "Avalanche Fuji",
    "Arc Testnet",
]


def index(request):
    config = constants.as_config_dict()
    context = {
        "config_json": json.dumps(config),
        "source_chains": SOURCE_CHAINS,
    }
    return render(request, "pay/index.html", context)
