import urllib.request

sys.path.insert(0, __import__("os").path.dirname(__import__("os").path.abspath(__file__)))
from load_config import cfg  # noqa: E402  （同目录的配置读取器）
import json

from cf_cfg import ACC_ID as acc_id, TOKEN as token  # noqa: E402

# Let's query zone or worker requests
query = {
    "query": f"""query {{
  viewer {{
    accounts(filter: {{accountTag: "{acc_id}"}}) {{
      workersInvocationsAdaptive(limit: 10, filter: {{date_geq: "2026-10-02"}}) {{
        sum {{
          subrequests
          requests
          errors
        }}
        dimensions {{
          scriptName
          status
        }}
      }}
    }}
  }}
}}"""
}

req = urllib.request.Request(
    'https://api.cloudflare.com/client/v4/graphql',
    data=json.dumps(query).encode('utf-8'),
    headers={'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'},
    method='POST'
)

try:
    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode('utf-8'))
        print(json.dumps(data, indent=2))
except Exception as e:
    print('Error:', e)
