from django.core.validators import RegexValidator
from django.db import models

address_validator = RegexValidator(
    regex=r"^0x[a-fA-F0-9]{40}$",
    message="Must be a 0x-prefixed 40-character hex address.",
)


class WalletStats(models.Model):
    address = models.CharField(
        max_length=42,
        unique=True,
        db_index=True,
        validators=[address_validator],
    )
    total_volume = models.DecimalField(max_digits=24, decimal_places=6, default=0)
    tx_count = models.PositiveIntegerField(default=0)
    xp = models.PositiveIntegerField(default=0)
    last_tx_hash = models.CharField(max_length=66, blank=True, default="")
    first_seen_at = models.DateTimeField(auto_now_add=True)
    last_tx_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.address} ({self.xp} XP)"
