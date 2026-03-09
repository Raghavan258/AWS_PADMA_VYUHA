import json
import urllib.request
import os

def lambda_handler(event, context):
    try:
        # Parse the incoming JSON body
        body = json.loads(event.get('body', '{}'))
        curriculum = body.get('curriculum', [])
        file_name = body.get('fileName', 'this course')
        
        api_key = os.environ.get('ANTHROPIC_API_KEY')
        if not api_key:
            return {
                "statusCode": 500,
                "headers": {"Access-Control-Allow-Origin": "*"},
                "body": json.dumps({"error": "Missing Anthropic API key"})
            }

        # Prompt format instructing Claude to return clean JSON
        system_prompt = f"""You are an AI quiz generator for a course called {file_name}.
The course covers the following concepts: {json.dumps(curriculum)}.
Generate exactly 5 multiple-choice questions based on this curriculum.

You MUST respond with purely valid, parseable JSON data in the following exact format, with NO markdown formatting, NO conversational text, and NO backticks:
{{
  "questions": [
    {{
      "question": "The question text here?",
      "options": ["A", "B", "C", "D"],
      "answer": "A"
    }}
  ]
}}
"""
        
        request_body = {
            "model": "claude-sonnet-4-20250514", # Using user's specific string
            "max_tokens": 1500,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": "Generate the quiz now. Remember, reply ONLY with valid JSON."}
            ]
        }
        
        req = urllib.request.Request(
            'https://api.anthropic.com/v1/messages',
            data=json.dumps(request_body).encode('utf-8'),
            headers={
                'x-api-key': api_key,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json'
            },
            method='POST'
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        # Extract the Claude reply text
        reply = result.get('content', [{}])[0].get('text', '')
        
        # Sometimes LLMs wrap in ```json ... ``` despite instructions. Clean it up:
        clean_reply = reply.strip()
        if clean_reply.startswith("```json"):
            clean_reply = clean_reply[7:]
        if clean_reply.startswith("```"):
            clean_reply = clean_reply[3:]
        if clean_reply.endswith("```"):
            clean_reply = clean_reply[:-3]
        clean_reply = clean_reply.strip()
        
        # Validate that it parses cleanly
        quiz_data = json.loads(clean_reply)
        
        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Allow-Methods": "OPTIONS,POST"
            },
            "body": json.dumps(quiz_data)
        }
        
    except json.JSONDecodeError as e:
        print("JSON parse error:", str(e), "Raw reply:", reply)
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": "Failed to generate valid JSON quiz format."})
        }
    except Exception as e:
        print("Error:", str(e))
        return {
            "statusCode": 500,
            "headers": {"Access-Control-Allow-Origin": "*"},
            "body": json.dumps({"error": str(e)})
        }
