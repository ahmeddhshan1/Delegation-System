from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from .models import MainEvent, SubEvent, Nationality, Cities, AirLine, AirPort, EquivalentJob, Delegation, Member, CheckOut

channel_layer = get_channel_layer()

def send_update_signal(model_name, action, instance_id=None):
    """Send update message to all connected WebSocket clients."""
    async_to_sync(channel_layer.group_send)(
        "updates",
        {
            "type": "stats_update",
            "message": f"{model_name} {action}",
            "model": model_name,
            "action": action,
            "id": str(instance_id) if instance_id else None,
        },
    )

# ------------------------------
# Generic signals for all models
# ------------------------------

@receiver(post_save, sender=MainEvent)
def main_event_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("MainEvent", action, instance.id)

@receiver(post_delete, sender=MainEvent)
def main_event_deleted(sender, instance, **kwargs):
    send_update_signal("MainEvent", "deleted", instance.id)

# You can repeat the same pattern for other models
@receiver(post_save, sender=SubEvent)
def sub_event_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("SubEvent", action, instance.id)

@receiver(post_delete, sender=SubEvent)
def sub_event_deleted(sender, instance, **kwargs):
    send_update_signal("SubEvent", "deleted", instance.id)

@receiver(post_save, sender=Delegation)
def delegation_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("Delegation", action, instance.id)

@receiver(post_delete, sender=Delegation)
def delegation_deleted(sender, instance, **kwargs):
    send_update_signal("Delegation", "deleted", instance.id)

@receiver(post_save, sender=Member)
def member_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("Member", action, instance.id)

@receiver(post_delete, sender=Member)
def member_deleted(sender, instance, **kwargs):
    send_update_signal("Member", "deleted", instance.id)

@receiver(post_save, sender=CheckOut)
def checkout_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("CheckOut", action, instance.id)

@receiver(post_delete, sender=CheckOut)
def checkout_deleted(sender, instance, **kwargs):
    send_update_signal("CheckOut", "deleted", instance.id)

# ------------------------------
# Lookup table models signals
# ------------------------------

@receiver(post_save, sender=Nationality)
def nationality_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("Nationality", action, instance.id)

@receiver(post_delete, sender=Nationality)
def nationality_deleted(sender, instance, **kwargs):
    send_update_signal("Nationality", "deleted", instance.id)

@receiver(post_save, sender=Cities)
def cities_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("Cities", action, instance.id)

@receiver(post_delete, sender=Cities)
def cities_deleted(sender, instance, **kwargs):
    send_update_signal("Cities", "deleted", instance.id)

@receiver(post_save, sender=AirLine)
def airline_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("AirLine", action, instance.id)

@receiver(post_delete, sender=AirLine)
def airline_deleted(sender, instance, **kwargs):
    send_update_signal("AirLine", "deleted", instance.id)

@receiver(post_save, sender=AirPort)
def airport_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("AirPort", action, instance.id)

@receiver(post_delete, sender=AirPort)
def airport_deleted(sender, instance, **kwargs):
    send_update_signal("AirPort", "deleted", instance.id)

@receiver(post_save, sender=EquivalentJob)
def equivalent_job_saved(sender, instance, created, **kwargs):
    action = "created" if created else "updated"
    send_update_signal("EquivalentJob", action, instance.id)

@receiver(post_delete, sender=EquivalentJob)
def equivalent_job_deleted(sender, instance, **kwargs):
    send_update_signal("EquivalentJob", "deleted", instance.id)

