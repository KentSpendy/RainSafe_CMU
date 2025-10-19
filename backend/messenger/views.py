import json
import requests
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt

# 🔐 This must match your VERIFY_TOKEN in Facebook setup
VERIFY_TOKEN = "rainsafe_verify_token"

# ⚙️ You’ll get this later when connecting your Page (Step 6)
PAGE_ACCESS_TOKEN = "EAAVuhEtZCLEMBPq1hPYa2DqOf7XPihPBZBpyNejKhDYZCWKeOSg2Di7k6Won0xqghYecep2UmBLMNpswEGbZAEc7cG2x7mtdHxAeSZConjLEnP93AOn6NZBVpZBp3NRNNF58gMqPTWaYZCxNYIZAigrfONOfZAd0TWh2NJqQoOn4hMrI6iHh9Ta7TjoVvaWBA19XbTXuD5"

@csrf_exempt
def webhook(request):
    if request.method == "GET":
        # Facebook verification step
        verify_token = request.GET.get("hub.verify_token")
        challenge = request.GET.get("hub.challenge")
        if verify_token == VERIFY_TOKEN:
            return HttpResponse(challenge)
        else:
            return HttpResponse("Invalid verification token", status=403)

    elif request.method == "POST":
        # Handle incoming messages or events
        data = json.loads(request.body.decode("utf-8"))
        print("📩 Received webhook event:", json.dumps(data, indent=2))

        if "entry" in data:
            for entry in data["entry"]:
                if "messaging" in entry:
                    for message_event in entry["messaging"]:
                        sender_id = message_event["sender"]["id"]

                        if "message" in message_event:
                            text = message_event["message"].get("text", "")
                            if text:
                                reply_to_user(sender_id, f"☔ RainSafe here! You said: {text}")

        return HttpResponse(status=200)

    return HttpResponse("Method not allowed", status=405)


def reply_to_user(recipient_id, message_text):
    """Send a message back to the user."""
    url = f"https://graph.facebook.com/v19.0/me/messages?access_token={PAGE_ACCESS_TOKEN}"
    payload = {
        "recipient": {"id": recipient_id},
        "message": {"text": message_text},
    }
    headers = {"Content-Type": "application/json"}
    requests.post(url, json=payload, headers=headers)










# Old content



# from django.shortcuts import render
# from django.http import HttpResponse
# from django.views.decorators.csrf import csrf_exempt

# # You can set this to any string you like; it must match the one on Facebook
# VERIFY_TOKEN = "rainsafe_verify_token"

# @csrf_exempt
# def facebook_webhook(request):
#     if request.method == "GET":
#         # Facebook verification process
#         verify_token = request.GET.get("hub.verify_token")
#         challenge = request.GET.get("hub.challenge")
#         if verify_token == VERIFY_TOKEN:
#             return HttpResponse(challenge)
#         return HttpResponse("Invalid verification token", status=403)

#     # For POST requests (Facebook events)
#     if request.method == "POST":
#         return HttpResponse("Event received")
    
#     return HttpResponse("Method not allowed", status=405)
