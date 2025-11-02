from channels.generic.websocket import AsyncJsonWebsocketConsumer

class UpdatesConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        # Add to general updates group
        await self.channel_layer.group_add("updates", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard("updates", self.channel_name)

    # Real-time update handlers
    async def stats_update(self, event):
        await self.send_json({
            'type': 'stats_update',
            'message': event.get('message', 'تم تحديث الإحصائيات'),
            'model': event.get('model', ''),
            'action': event.get('action', ''),
            'id': event.get('id', ''),
            'data': event.get('data', {})
        })