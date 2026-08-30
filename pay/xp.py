from decimal import Decimal

# XP per USDC of cumulative volume, plus a flat bonus per transaction so a
# small testnet amount still earns something visible.
XP_PER_USDC = 100
XP_PER_TX = 10

# (xp threshold, level name), ascending.
LEVELS = [
    (0, "Newcomer"),
    (100, "Explorer"),
    (500, "Voyager"),
    (2000, "Pioneer"),
    (5000, "Pathfinder"),
    (15000, "Legend"),
]


def compute_xp(total_volume: Decimal, tx_count: int) -> int:
    return int(round(total_volume * XP_PER_USDC)) + tx_count * XP_PER_TX


def level_info(xp: int) -> dict:
    level_index = 0
    for i, (threshold, _name) in enumerate(LEVELS):
        if xp >= threshold:
            level_index = i
        else:
            break

    threshold, name = LEVELS[level_index]
    is_max_level = level_index == len(LEVELS) - 1
    next_threshold = LEVELS[level_index + 1][0] if not is_max_level else None

    xp_into_level = xp - threshold
    xp_for_next_level = (next_threshold - threshold) if next_threshold is not None else None
    progress = 1.0 if is_max_level else min(1.0, xp_into_level / xp_for_next_level)

    return {
        "level": level_index + 1,
        "name": name,
        "xp": xp,
        "xpIntoLevel": xp_into_level,
        "xpForNextLevel": xp_for_next_level,
        "nextLevelName": LEVELS[level_index + 1][1] if not is_max_level else None,
        "progress": progress,
        "isMaxLevel": is_max_level,
    }
