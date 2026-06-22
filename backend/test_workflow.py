import sys
from pathlib import Path
sys.path.append(str(Path(__file__).resolve().parent.parent))

from fastapi.testclient import TestClient
from backend.app import app
import json

payload = {
    "Fe": 60.5,
    "c": 0.02,
    "mn": 0.05,
    "si": 0.05,
    "cr": 0.01,
    "ni": 19.7,
    "mo": 2.95,
    "v": 0.01,
    "n": 0,
    "nb": 0.01,
    "co": 15,
    "w": 0,
    "al": 0.15,
    "ti": 1.55
}

def run_tests():
    with TestClient(app) as client:
        print("Testing /predict endpoint (all properties)...")
        response = client.post("/predict", json=payload)
        if response.status_code == 200:
            print("SUCCESS /predict:")
            for p in response.json().get("predictions", []):
                print(f"  {p['label']}: {p['prediction']} {p['unit']}")
        else:
            print("FAILED /predict:")
            print(response.text)

        for target in ("yield_strength", "tensile_strength", "elongation"):
            print(f"\nTesting /explain endpoint (target={target})...")
            response = client.post("/explain", json={"features": payload, "target": target})
            if response.status_code == 200:
                data = response.json()
                print(f"SUCCESS /explain: {data.get('label')} | base={data.get('base_value')} "
                      f"| prediction={data.get('prediction')} {data.get('unit')} "
                      f"| features={len(data.get('features', []))}")
            else:
                print("FAILED /explain:", response.text)

        print("\nTesting /dependence endpoint (feature=ni, target=tensile_strength)...")
        response = client.post(
            "/dependence",
            json={"features": payload, "feature": "ni", "target": "tensile_strength", "points": 5},
        )
        if response.status_code == 200:
            data = response.json()
            print(f"SUCCESS /dependence: {data.get('label')} | feature={data.get('feature')} "
                  f"| current={data.get('current_value')} | points={len(data.get('points', []))}")
            print("Points:", json.dumps(data.get("points", []), indent=2))
        else:
            print("FAILED /dependence:", response.text)

if __name__ == "__main__":
    run_tests()
